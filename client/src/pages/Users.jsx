import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth-context.jsx';

const ROLES = ['viewer', 'manager', 'admin'];

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const isAdmin = me.role === 'admin';

  const load = useCallback(() => {
    api('/api/users')
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (isAdmin || me.role === 'manager') load();
    else setError('Your role (viewer) cannot manage users. Sign in as admin@nexus.dev to try it.');
  }, [isAdmin, me.role, load]);

  async function createUser(e) {
    e.preventDefault();
    try {
      await api('/api/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      setError(null);
      load();
    } catch (err) {
      setError(err.body?.fields?.map((f) => f.message).join(', ') || err.message);
    }
  }

  async function patch(id, body) {
    try {
      await api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setError(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Users</h1>
        <p className="text-sm text-slate-500">Role-based access control in action</p>
      </div>

      {error && <div className="card text-rose-300 text-sm">{error}</div>}

      {isAdmin && (
        <form onSubmit={createUser} className="card grid sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="min 8 chars" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn-primary">Add user</button>
        </form>
      )}

      {users && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                {isAdmin && <th className="table-th">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-line/30">
                  <td className="table-td text-slate-200">{u.name}</td>
                  <td className="table-td text-slate-400">{u.email}</td>
                  <td className="table-td">
                    {isAdmin && u.id !== me.id ? (
                      <select className="input py-1 text-xs w-28" value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className="capitalize text-slate-300">{u.role}</span>
                    )}
                  </td>
                  <td className="table-td">
                    <span className={`badge ${u.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {u.active ? 'active' : 'deactivated'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="table-td">
                      {u.id !== me.id && (
                        <button className="btn-ghost text-xs border border-line" onClick={() => patch(u.id, { active: !u.active })}>
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
