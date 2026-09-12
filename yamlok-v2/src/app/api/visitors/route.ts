import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * Visitor analytics — backed by Upstash Redis (free REST API).
 *
 * Two Redis structures:
 *   visitors:total          ← INCR  (integer, lifetime total)
 *   visitors:day:YYYY-MM-DD ← INCR  (integer per day)
 *   visitors:days           ← ZADD  (sorted set: score=date as YYYYMMDD int, member=YYYY-MM-DD)
 *
 * Required env vars (set in Vercel dashboard):
 *   UPSTASH_REDIS_REST_URL    — e.g. https://xxxxxxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN  — your Upstash REST token
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Execute a single Redis command via the Upstash REST API. */
async function redis<T = unknown>(command: unknown[]): Promise<T> {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error('Upstash env vars not set');
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

// ── GET /api/visitors ── admin-only: return all day logs + total
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!REDIS_URL || !REDIS_TOKEN) {
    // Upstash not configured — return zeros gracefully
    return NextResponse.json({ total: 0, logs: [] });
  }

  try {
    // Get all day keys from the sorted set (oldest → newest)
    const days = await redis<string[]>(['ZRANGE', 'visitors:days', 0, -1]);
    if (!days || days.length === 0) {
      const total = await redis<number>(['GET', 'visitors:total']).catch(() => 0);
      return NextResponse.json({ total: total ?? 0, logs: [] });
    }

    // Pipeline: MGET all per-day counters + GET total in one round-trip
    const mgetResult = await redis<(string | null)[]>(['MGET', ...days.map(d => `visitors:day:${d}`)]);
    const total = await redis<number>(['GET', 'visitors:total']).catch(() => 0);

    const logs = days.map((date, i) => ({
      date,
      count: parseInt(mgetResult[i] ?? '0', 10) || 0,
    }));

    return NextResponse.json({ total: total ?? 0, logs });
  } catch (e: unknown) {
    return NextResponse.json({ total: 0, logs: [], error: String(e) });
  }
}

// ── POST /api/visitors ── public: increment today's visit count
export async function POST(req: Request) {
  let date: string;
  try {
    const body = await req.json();
    date = typeof body.date === 'string' ? body.date : new Date().toISOString().slice(0, 10);
  } catch {
    date = new Date().toISOString().slice(0, 10);
  }

  if (!REDIS_URL || !REDIS_TOKEN) {
    // Upstash not configured — silently succeed so the site still works
    return NextResponse.json({ ok: true });
  }

  try {
    const score = parseInt(date.replace(/-/g, ''), 10); // YYYYMMDD as sort score
    await Promise.all([
      redis(['INCR', 'visitors:total']),
      redis(['INCR', `visitors:day:${date}`]),
      redis(['ZADD', 'visitors:days', 'NX', score, date]),
    ]);
  } catch { /* never crash the public site over analytics */ }

  return NextResponse.json({ ok: true });
}
