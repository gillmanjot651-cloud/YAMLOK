import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const MEDIA_PATH = path.join(process.cwd(), 'public', 'media.json');

// ── GET /api/media ── read current media.json (public, no auth needed)
export async function GET() {
  try {
    const raw = await readFile(MEDIA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ images: [], videos: [] });
  }
}

// ── POST /api/media ── save + optionally push to GitHub (auth required)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // ── 1. Write locally ──
  await writeFile(MEDIA_PATH, JSON.stringify(body, null, 2), 'utf-8');

  // ── 2. Push to GitHub if env vars are set ──
  const token    = process.env.GITHUB_TOKEN;
  const repo     = process.env.GITHUB_REPO;
  const branch   = process.env.GITHUB_BRANCH    || 'main';
  const filePath = process.env.GITHUB_MEDIA_PATH || 'public/media.json';

  if (token && repo) {
    try {
      const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      };

      let sha: string | undefined;
      const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
      if (getRes.ok) sha = (await getRes.json()).sha;

      const content = Buffer.from(JSON.stringify(body, null, 2), 'utf-8').toString('base64');
      const putBody: Record<string, string> = { message: 'Admin: update media.json', content, branch };
      if (sha) putBody.sha = sha;

      const putRes = await fetch(apiBase, {
        method: 'PUT',
        headers,
        body: JSON.stringify(putBody),
      });

      if (!putRes.ok) {
        const err = await putRes.json();
        return NextResponse.json({ saved: true, published: false, githubError: err.message }, { status: 207 });
      }
    } catch (e: unknown) {
      return NextResponse.json({ saved: true, published: false, githubError: String(e) }, { status: 207 });
    }
  }

  return NextResponse.json({ saved: true, published: !!token && !!repo });
}
