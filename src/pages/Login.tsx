import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const { user, role, login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user && role) return <Navigate to="/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await login(email.trim(), password); navigate('/dashboard', { replace: true }); }
    catch (err) {
      const code = (err as { code?: string }).code;
      setError(code?.startsWith('auth/') ? 'Email atau kata sandi salah.' : err instanceof Error ? err.message : 'Gagal masuk.');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm card p-7 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Lock size={20} /></span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">BILL GATES</h1>
            <p className="text-xs text-slate-500">Masuk untuk membuka Command Center</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-slate-700">Email
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Kata sandi
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </label>
        {(error || authError) && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error ?? authError}</p>}
        <button disabled={busy} className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
          {busy ? 'Memeriksa...' : 'Masuk'}
        </button>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Prototipe ini hanya berisi data klaim SINTETIS. Setiap akses dan keputusan dicatat pada log audit.
          Sesi berakhir otomatis setelah 15 menit tanpa aktivitas.
        </p>
      </form>
    </div>
  );
}
