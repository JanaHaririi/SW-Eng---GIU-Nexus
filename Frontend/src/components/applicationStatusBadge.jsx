import { formatStatusLabel } from '../utils/formatters';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  shortlisted: 'bg-sky-100 text-sky-800 ring-sky-200',
  accepted: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
};

const ApplicationStatusBadge = ({ status = 'pending', className = '' }) => {
  const normalizedStatus = String(status || 'pending').toLowerCase();
  const colorClass =
    STATUS_STYLES[normalizedStatus] || 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${colorClass} ${className}`}
    >
      {formatStatusLabel(normalizedStatus)}
    </span>
  );
};

export default ApplicationStatusBadge;
