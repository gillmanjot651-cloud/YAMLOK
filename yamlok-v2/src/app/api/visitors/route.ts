import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const VISITORS_PATH = path.join(process.cwd(), 'public', 'visitors.json');

interface DayLog { date: string; count: number }
interface VisitorStore { logs: DayLog[] }

async function readStore(): Promise<VisitorStore> {
  try {
    const raw = await readFile(VISITORS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // migrate legacy format { count: N }
    if (typeof parsed.count === 'number') return { logs: [] };
    return parsed as VisitorStore;
  } catch {
    return { logs: [] };
  }
}

// ── GET /api/visitors ── admin-only: return full logs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await readStore();
  const total = store.logs.reduce((s, l) => s + l.count, 0);
  return NextResponse.json({ total, logs: store.logs });
}

// ── POST /api/visitors ── public: increment today's count
export async function POST(req: Request) {
  let date: string;
  try {
    const body = await req.json();
    date = typeof body.date === 'string' ? body.date : new Date().toISOString().slice(0, 10);
  } catch {
    date = new Date().toISOString().slice(0, 10);
  }

  const store = await readStore();
  const existing = store.logs.find(l => l.date === date);
  if (existing) {
    existing.count += 1;
  } else {
    store.logs.push({ date, count: 1 });
    store.logs.sort((a, b) => a.date.localeCompare(b.date));
  }

  await writeFile(VISITORS_PATH, JSON.stringify(store, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}
