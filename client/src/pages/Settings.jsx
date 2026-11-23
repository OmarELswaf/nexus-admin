import { useAuth } from '../auth-context.jsx';

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-500">Your session and account</p>
      </div>
      <div className="card space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Name</div>
          <div className="text-slate-200">{user.name}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
          <div className="text-slate-200">{user.email}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Role</div>
          <div className="capitalize text-accent">{user.role}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Session</div>
          <div className="text-slate-400 text-sm">
            Short-lived JWT access token (15 min) refreshed automatically through a rotating httpOnly
            refresh cookie (7 days). Signing out revokes the refresh token server-side.
          </div>
        </div>
      </div>
      <div className="card text-sm text-slate-400">
        This is a portfolio demo. All data is seeded, fictional and resets periodically. Do not enter
        real personal information.
      </div>
    </div>
  );
}
