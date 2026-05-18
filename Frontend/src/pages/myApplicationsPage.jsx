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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track the jobs you applied to and their latest recruiter status.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={fetchApplications}
            className="ml-3 font-semibold text-red-800 underline"
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
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No applications found
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {status
              ? 'No applications match the selected status.'
              : 'Once you apply to jobs, they will appear here.'}
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-slate-600">
            Showing {pluralize(applications.length, 'application')}
            {total ? ` out of ${total}` : ''}
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-200">
              {applications.map((application) => {
                const job = application.job || {};

                return (
                  <article
                    key={application._id}
                    className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {job.title || 'Untitled job'}
                        </h2>
                        <ApplicationStatusBadge status={application.status} />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>{job.company || 'Company not listed'}</span>
                        <span>{job.location || 'Location not listed'}</span>
                        <span>{job.type || 'Type not listed'}</span>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        Applied on {formatDate(application.appliedAt || application.createdAt)}
                      </p>
                    </div>

                    {job._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Job
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
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              disabled={page === 1}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.min(currentPage + 1, totalPages))
              }
              disabled={page >= totalPages}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
