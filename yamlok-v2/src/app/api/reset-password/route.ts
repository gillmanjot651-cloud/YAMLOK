import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

// ── POST /api/reset-password ──
// Body: { token: string; newPassword: string }
// Validates against RESET_TOKEN env var, then bcrypt-hashes and writes
// the new password into .env.local so it persists across restarts.
export async function POST(req: Request) {
  const { token, newPassword } = await req.json().catch(() => ({}));

  const validToken = process.env.RESET_TOKEN;
  if (!validToken) {
    return NextResponse.json({ error: 'Password reset is not configured. Set RESET_TOKEN in .env.local.' }, { status: 503 });
  }
  if (!token || token !== validToken) {
    return NextResponse.json({ error: 'Invalid reset token.' }, { status: 403 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  // Hash the new password
  const hashed = await bcrypt.hash(newPassword, 10);

  // Write into .env.local — update ADMIN_PASSWORD line if present, else append
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    let envContent = '';
    try { envContent = await readFile(envPath, 'utf-8'); } catch { /* file may not exist */ }

    const line = `ADMIN_PASSWORD=${hashed}`;
    if (/^ADMIN_PASSWORD=/m.test(envContent)) {
      envContent = envContent.replace(/^ADMIN_PASSWORD=.*/m, line);
    } else {
      envContent = envContent.trimEnd() + '\n' + line + '\n';
    }
    await writeFile(envPath, envContent, 'utf-8');
  } catch {
    return NextResponse.json({ error: 'Could not write .env.local on server.' }, { status: 500 });
  }

  // Also update the live process env so the new password works immediately
  // without needing a server restart
  process.env.ADMIN_PASSWORD = hashed;

  return NextResponse.json({ ok: true });
}
