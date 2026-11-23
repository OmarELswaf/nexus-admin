import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth-context.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const STATUSES = ['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const money = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export default function Orders() {
  const { user } = useAuth();
  const canEdit = user.role === 'admin' || user.role === 'manager';
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page, pageSize: 10 });
    if (status) params.set('status', status);
    if (q.trim()) params.set('q', q.trim());
    api(`/api/orders?${params}`).then(setData).catch((e) => setError(e.message));
  }, [status, q, page]);

  useEffect(load, [load]);

  async function updateStatus(id, next) {
    try {
      await api(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Orders</h1>
          <p className="text-sm text-slate-500">{data ? `${data.total} orders` : 'Loading...'}</p>
        </div>
        <div className="flex gap-2">
          <input
            className="input w-48"
            placeholder="Search customer or ID"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
          <select
            className="input w-36"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="card text-rose-300 text-sm">{error}</div>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="table-th">Order</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Items</th>
              <th className="table-th">Total</th>
              <th className="table-th">Status</th>
              <th className="table-th">Date</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders || []).map((o) => (
              <tr key={o.id} className="hover:bg-line/30">
                <td className="table-td font-mono text-xs text-slate-400">{o.id}</td>
                <td className="table-td">
                  <div className="text-slate-200">{o.customer.name}</div>
                  <div className="text-xs text-slate-500">{o.customer.email}</div>
                </td>
                <td className="table-td text-slate-400 text-xs">
                  {o.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                </td>
                <td className="table-td text-slate-200">{money(o.total)}</td>
                <td className="table-td">
                  {canEdit ? (
                    <select
                      className="input py-1 text-xs w-28"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {STATUSES.slice(1).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={o.status} />
                  )}
                </td>
                <td className="table-td text-slate-400">{o.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Page {data?.page || 1} of {data?.pages || 1}
        </span>
        <div className="flex gap-2">
          <button className="btn-ghost border border-line" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <button
            className="btn-ghost border border-line"
            disabled={!data || page >= data.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
