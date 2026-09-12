import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// ── GET /api/media ── public: read media.json from GitHub at runtime
// Fetching from GitHub (not the baked static file) means changes made via
// the admin panel are visible instantly — no redeployment needed.
export async function GET() {
  const token    = process.env.GITHUB_TOKEN;
  const repo     = process.env.GITHUB_REPO;
  const branch   = process.env.GITHUB_CONTENT_BRANCH || process.env.GITHUB_BRANCH || 'content';
  const filePath = process.env.GITHUB_MEDIA_PATH || 'yamlok-v2/public/media.json';

  // If GitHub env vars are set, read directly from the repo (instant updates)
  if (token && repo) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const json    = await res.json();
        const content = Buffer.from(json.content, 'base64').toString('utf-8');
        return NextResponse.json(JSON.parse(content));
      }
    } catch { /* fall through to static fallback */ }
  }

  // Fallback: serve the static file bundled at build time (local dev / missing env vars)
  try {
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/media.json`, { cache: 'no-store' });
    if (res.ok) return NextResponse.json(await res.json());
  } catch { /* ignore */ }

  return NextResponse.json({ images: [], videos: [] });
}

// ── POST /api/media ── admin-only: push updated media.json to GitHub
// Vercel's filesystem is read-only — GitHub is the only persistence layer.
// Every admin save commits directly to the repo; Vercel auto-redeploys.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const token    = process.env.GITHUB_TOKEN;
  const repo     = process.env.GITHUB_REPO;
  const branch   = process.env.GITHUB_CONTENT_BRANCH || process.env.GITHUB_BRANCH || 'content';
  const filePath = process.env.GITHUB_MEDIA_PATH || 'yamlok-v2/public/media.json';

  if (!token || !repo) {
    return NextResponse.json({
      error: 'GITHUB_TOKEN and GITHUB_REPO must be set in your Vercel environment variables. See README.',
    }, { status: 503 });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  // Fetch current SHA so GitHub accepts the update
  let sha: string | undefined;
  try {
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (getRes.ok) sha = (await getRes.json()).sha;
  } catch { /* new file — no SHA needed */ }

  const content  = Buffer.from(JSON.stringify(body, null, 2), 'utf-8').toString('base64');
  const putBody: Record<string, string> = { message: 'Admin: update media.json', content, branch };
  if (sha) putBody.sha = sha;

  try {
    const putRes = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(putBody) });
    if (!putRes.ok) {
      const err = await putRes.json();
      return NextResponse.json({ saved: false, published: false, githubError: err.message }, { status: 502 });
    }
  } catch (e: unknown) {
    return NextResponse.json({ saved: false, published: false, githubError: String(e) }, { status: 502 });
  }

  return NextResponse.json({ saved: true, published: true });
}
