import { useAuth } from '../auth-context.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-14 border-b border-line flex items-center justify-between px-4 md:px-6 bg-panel/40">
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-accent grid place-items-center font-bold text-white text-sm">N</div>
        <span className="font-semibold text-white text-sm">Nexus Admin</span>
      </div>
      <div className="hidden md:block text-sm text-slate-400">
        Demo environment: seeded data, resets periodically
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300 hidden sm:block">{user?.email}</span>
        <button onClick={logout} className="btn-ghost border border-line">
          Sign out
        </button>
      </div>
    </header>
  );
}
