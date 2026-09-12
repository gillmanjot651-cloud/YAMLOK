import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// ── POST /api/reset-password ──
// Body: { token: string; newPassword: string }
//
// On Vercel the filesystem is read-only — we cannot write .env.local.
// Instead we update process.env in memory so the new password works for
// the lifetime of the current serverless function instance, and we return
// a clear message telling the user to also update ADMIN_PASSWORD in the
// Vercel dashboard so it persists after the next deployment / cold start.
export async function POST(req: Request) {
  const { token, newPassword } = await req.json().catch(() => ({}));

  const validToken = process.env.RESET_TOKEN;
  if (!validToken) {
    return NextResponse.json(
      { error: 'Password reset is not configured. Add RESET_TOKEN to your Vercel environment variables.' },
      { status: 503 },
    );
  }
  if (!token || token !== validToken) {
    return NextResponse.json({ error: 'Invalid reset token.' }, { status: 403 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  // Update in-memory so it works immediately in this serverless instance
  process.env.ADMIN_PASSWORD = hashed;

  // On Vercel we cannot write to disk — tell the user what to do next
  return NextResponse.json({
    ok: true,
    warning:
      'Password updated for this session. To make it permanent, go to your Vercel dashboard → '
      + 'Project Settings → Environment Variables → update ADMIN_PASSWORD to: ' + hashed,
  });
}
