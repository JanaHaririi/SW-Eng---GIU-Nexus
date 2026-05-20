import { useEffect, useState } from 'react';
import Spinner from '../../components/spinner';
import CategoryBadge from '../../components/categoryBadge';
import { getAllJobs, deleteJob } from '../../services/adminService';

const STATUS_STYLES = {
  open: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  closed: 'bg-slate-200 text-slate-700 ring-slate-300',
};

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs();
      setJobs(data.jobs || data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete job.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          All jobs
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every job posting on the platform, open and closed.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">No jobs found</p>
          <p className="mt-1 text-sm text-ink-muted">
            There are no jobs posted on the platform yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const statusStyle =
              STATUS_STYLES[job.status] || STATUS_STYLES.closed;
            return (
              <article
                key={job._id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-bold tracking-tight text-ink">
                      {job.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${statusStyle}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {job.company || 'Company not listed'} ·{' '}
                    {job.location || 'Location not listed'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.type && (
                      <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
                        {job.type}
                      </span>
                    )}
                    {job.category && <CategoryBadge category={job.category} />}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(job._id)}
                  className="shrink-0 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
