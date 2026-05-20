import { Link } from 'react-router-dom';
import CategoryBadge from './categoryBadge';
import SaveJobButton from './saveJobButton';
import { useAuth } from '../context/authContext';
import { deleteJob } from '../services/jobService';

export default function JobCard({
  job,
  onSaveToggle,
  onDelete,
  showScore = false,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!job) return null;

  const ownerId =
    job.createdBy && typeof job.createdBy === 'object'
      ? job.createdBy._id
      : job.createdBy;
  const isOwner =
    user?._id && ownerId && String(ownerId) === String(user._id);
  const canDelete = isAdmin || (user?.role === 'recruiter' && isOwner);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteJob(job._id);
      onDelete?.(job._id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete job');
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-ink">
            {job.title}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            by{' '}
            <span className="font-medium text-ink">
              {job.createdBy?.username || 'Unknown recruiter'}
            </span>
          </p>
        </div>

        <SaveJobButton job={job} onToggle={onSaveToggle} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {job.type && (
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
            {job.type}
          </span>
        )}

        {job.location && (
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
            {job.location}
          </span>
        )}

        {job.category && <CategoryBadge category={job.category} />}

        {showScore && job.score && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
            {Math.round(job.score * 100)}% match
          </span>
        )}
      </div>

      {job.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink-muted">
          {job.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          View details →
        </Link>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
