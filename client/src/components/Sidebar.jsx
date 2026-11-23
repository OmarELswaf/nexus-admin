import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth-context.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10' },
  { to: '/orders', label: 'Orders', icon: 'M9 17h6M9 13h6M9 9h1m4-4H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3' },
  { to: '/users', label: 'Users', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7-3a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2L14 21h-4l-.5-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 015 12a7 7 0 01.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L10 3h4l.5 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.06.4.1.8.1 1.2z' },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="w-60 shrink-0 border-r border-line bg-panel/60 hidden md:flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent grid place-items-center font-bold text-white">N</div>
          <div>
            <div className="font-semibold text-white leading-tight">Nexus Admin</div>
            <div className="text-xs text-slate-500">Sales &amp; operations</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-accentSoft text-white' : 'text-slate-400 hover:text-white hover:bg-line/50'
              }`
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-line text-xs text-slate-500">
        Signed in as
        <div className="text-slate-300 font-medium truncate">{user?.name}</div>
        <div className="capitalize text-accent">{user?.role}</div>
      </div>
    </aside>
  );
}
