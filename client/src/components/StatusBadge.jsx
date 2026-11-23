const styles = {
  pending: 'bg-amber-500/15 text-amber-300',
  paid: 'bg-sky-500/15 text-sky-300',
  shipped: 'bg-violet-500/15 text-violet-300',
  delivered: 'bg-emerald-500/15 text-emerald-300',
  cancelled: 'bg-rose-500/15 text-rose-300',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${styles[status] || 'bg-line text-slate-300'}`}>{status}</span>;
}
