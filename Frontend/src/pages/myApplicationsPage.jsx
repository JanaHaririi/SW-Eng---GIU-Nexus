import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ApplicationStatusBadge from '../components/applicationStatusBadge';
import Skeleton from '../components/skeleton';
import { getMyApplications } from '../services/applicationService';
import { formatDate, pluralize } from '../utils/formatters';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 10;
  const totalPages = useMemo(
    () => Math.max(Math.ceil(total / limit), 1),
    [total]
  );

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyApplications({ status, page, limit });
      setApplications(data.applications || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load your applications. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status, page]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Pipeline
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            My applications
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track the jobs you've applied to and their latest recruiter status.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Filter by status
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={fetchApplications}
            className="ml-3 font-semibold text-red-800 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" rows={3} />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">
            No applications found
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {status
              ? 'No applications match the selected status.'
              : 'Once you apply to jobs, they will appear here.'}
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-ink-muted">
            Showing {pluralize(applications.length, 'application')}
            {total ? ` out of ${total}` : ''}
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="divide-y divide-line">
              {applications.map((application) => {
                const job = application.job || {};

                return (
                  <article
                    key={application._id}
                    className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight text-ink">
                          {job.title || 'Untitled job'}
                        </h2>
                        <ApplicationStatusBadge status={application.status} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                        <span>{job.company || 'Company not listed'}</span>
                        <span>{job.location || 'Location not listed'}</span>
                        <span>{job.type || 'Type not listed'}</span>
                      </div>

                      <p className="mt-3 text-xs text-ink-subtle">
                        Applied on{' '}
                        {formatDate(application.appliedAt || application.createdAt)}
                      </p>
                    </div>

                    {job._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex justify-center rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
                      >
                        View job
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-ink-muted">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyApplicationsPage;
