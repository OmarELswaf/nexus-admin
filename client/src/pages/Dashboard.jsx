import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { api } from '../api';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const money = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/analytics/overview').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card text-rose-300">{error}</div>;
  if (!data) return <div className="text-slate-400 text-sm animate-pulse">Loading dashboard...</div>;

  const { kpis, series, statusBreakdown, recentOrders } = data;
  const last30 = series.slice(-30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500">Store performance over the last 30 days (demo data)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (30d)" value={money(kpis.revenue30d)} hint={`${kpis.orders30d} orders this month`} />
        <StatCard label="Open orders" value={kpis.openOrders} hint={`${kpis.totalOrders} total orders`} />
        <StatCard label="Products" value={kpis.activeProducts} hint={`${kpis.products} in catalog`} />
        <StatCard label="Team members" value={kpis.users} hint="with dashboard access" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Revenue, last 30 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f7cff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#4f7cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2b45" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="#1f2b45" />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} stroke="#1f2b45" width={48} />
                <Tooltip
                  contentStyle={{ background: '#111a2e', border: '1px solid #1f2b45', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v) => [money(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f7cff" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Orders by status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(statusBreakdown).map(([status, count]) => ({ status, count }))}>
                <CartesianGrid stroke="#1f2b45" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#1f2b45" />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} stroke="#1f2b45" width={32} />
                <Tooltip
                  contentStyle={{ background: '#111a2e', border: '1px solid #1f2b45', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="#4f7cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-sm font-medium text-slate-300 mb-3">Recent orders</h2>
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th className="table-th">Order</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Total</th>
              <th className="table-th">Status</th>
              <th className="table-th">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-line/30">
                <td className="table-td font-mono text-xs text-slate-400">{o.id}</td>
                <td className="table-td text-slate-200">{o.customer.name}</td>
                <td className="table-td text-slate-200">{money(o.total)}</td>
                <td className="table-td"><StatusBadge status={o.status} /></td>
                <td className="table-td text-slate-400">{o.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
