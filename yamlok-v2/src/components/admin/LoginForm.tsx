'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'reset';

export default function LoginForm() {
  const [mode, setMode]           = useState<Mode>('login');

  // login state
  const [password, setPassword]   = useState('');
  const [loginError, setLoginErr] = useState('');
  const [logging, setLogging]     = useState(false);

  // reset state
  const [token, setToken]         = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [resetMsg, setResetMsg]   = useState('');
  const [resetErr, setResetErr]   = useState('');
  const [resetting, setResetting] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(''); setLogging(true);
    const res = await signIn('credentials', { password, redirect: false });
    setLogging(false);
    if (res?.ok) { router.refresh(); router.push('/admin'); }
    else { setLoginErr('Incorrect password.'); setPassword(''); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErr(''); setResetMsg('');
    if (newPw !== confirmPw) { setResetErr('Passwords do not match.'); return; }
    if (newPw.length < 6)    { setResetErr('Password must be at least 6 characters.'); return; }
    setResetting(true);
    try {
      const res  = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: newPw }),
      });
      const json = await res.json();
      if (res.ok) {
        setResetMsg('Password updated! You can now log in.');
        setToken(''); setNewPw(''); setConfirmPw('');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setResetErr(json.error || 'Reset failed.');
      }
    } catch {
      setResetErr('Network error. Try again.');
    }
    setResetting(false);
  };

  const inputCls = `bg-white/[0.04] border border-primary/20 rounded text-white px-3.5 py-2.5 text-sm
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all w-full`;

  return (
    <div className="bg-bg-card border border-primary/25 rounded-lg p-10 w-full max-w-sm flex flex-col gap-5"
      style={{ boxShadow: '0 0 60px rgba(0,234,255,0.08), 0 20px 60px rgba(0,0,0,0.6)' }}>

      <div className="font-rajdhani font-extrabold text-4xl text-center tracking-[4px]"
        style={{ textShadow: '0 0 20px rgba(0,234,255,0.4)' }}>YAMLOK</div>
      <div className="text-center text-primary/70 text-xs tracking-[3px] uppercase -mt-3">Admin Panel</div>

      {/* ── LOGIN FORM ── */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/55">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password" autoComplete="current-password" required className={inputCls} />
          </div>
          {loginError && <p className="text-[#ff4466] text-xs text-center">{loginError}</p>}
          <button type="submit" disabled={logging}
            className="mt-1 font-rajdhani font-bold text-sm uppercase tracking-wide text-white py-3 rounded
                       bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed">
            {logging ? 'Checking…' : 'ENTER'}
          </button>
          <button type="button" onClick={() => { setMode('reset'); setLoginErr(''); }}
            className="text-xs text-primary/50 hover:text-primary/80 transition-colors text-center mt-1">
            Forgot password?
          </button>
        </form>
      )}

      {/* ── RESET FORM ── */}
      {mode === 'reset' && (
        <form onSubmit={handleReset} className="flex flex-col gap-3">
          <p className="text-xs text-white/40 leading-relaxed text-center -mt-1">
            Enter the recovery token your admin gave you, then set a new password.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/55">Recovery Token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)}
              placeholder="Enter recovery token" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/55">New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="Min 6 characters" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/55">Confirm Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat new password" required className={inputCls} />
          </div>
          {resetErr && <p className="text-[#ff4466] text-xs text-center">{resetErr}</p>}
          {resetMsg && <p className="text-emerald-400 text-xs text-center">{resetMsg}</p>}
          <button type="submit" disabled={resetting}
            className="mt-1 font-rajdhani font-bold text-sm uppercase tracking-wide text-white py-3 rounded
                       bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed">
            {resetting ? 'Updating…' : 'RESET PASSWORD'}
          </button>
          <button type="button" onClick={() => { setMode('login'); setResetErr(''); setResetMsg(''); }}
            className="text-xs text-primary/50 hover:text-primary/80 transition-colors text-center">
            ← Back to login
          </button>
        </form>
      )}
    </div>
  );
}
