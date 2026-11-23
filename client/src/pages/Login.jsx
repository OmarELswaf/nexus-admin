import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@nexus.dev');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate(location.state?.from || '/', { replace: true });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-accent grid place-items-center font-bold text-white text-lg">N</div>
          <div>
            <h1 className="text-xl font-semibold text-white">Nexus Admin</h1>
            <p className="text-xs text-slate-500">JWT-secured admin dashboard</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter the demo password"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500 text-center space-y-1">
          <p className="text-slate-400">Live demo, seeded demo data only.</p>
          <p>
            Accounts: <span className="text-slate-300">admin@nexus.dev</span> or{' '}
            <span className="text-slate-300">viewer@nexus.dev</span>
          </p>
          <p>
            Password: <code className="text-accent">NexusDemo!2026</code>
          </p>
        </div>
      </div>
    </div>
  );
}
