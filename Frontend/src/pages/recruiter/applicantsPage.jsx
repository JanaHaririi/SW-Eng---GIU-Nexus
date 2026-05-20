import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/spinner';
import ApplicationStatusBadge from '../../components/applicationStatusBadge';
import Skeleton from '../../components/skeleton';
import {
  getJobApplicants,
  updateApplicationStatus,
} from '../../services/applicationService';
import { formatDate, pluralize } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  const limit = 10;
  const totalPages = useMemo(
    () => Math.max(Math.ceil(total / limit), 1),
    [total]
  );

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId, status, page]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    try {
      const data = await getJobApplicants(jobId, { status, page, limit });
      setJob(data.job || null);
      setApplicants(data.applicants || data.applications || data.data || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load applicants. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const data = await updateApplicationStatus(applicationId, newStatus);
      const updatedApplication = data.application;
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, ...(updatedApplication || {}), status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError(
        err.response?.data?.message ||
          'Failed to update application status. Please try again.'
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFilterChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-ink-muted">Loading applicants…</span>
        </div>
        <Skeleton className="h-24 w-full" rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={fetchJobAndApplicants}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={() => navigate('/recruiter')}
        className="mb-4 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
      >
        ← Back to dashboard
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Applicants
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            {job?.title || 'Job applicants'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {job?.company || 'Company not listed'} ·{' '}
            {job?.location || 'Location not listed'}
          </p>
          <p className="mt-1 text-xs text-ink-subtle">
            {pluralize(total || applicants.length, 'applicant')}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Filter by status
          <select
            value={status}
            onChange={handleFilterChange}
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {applicants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">No applicants</p>
          <p className="mt-1 text-sm text-ink-muted">
            {status
              ? 'No applicants match the selected status.'
              : 'No applicants have applied for this position yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Cover letter
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {applicants.map((application) => {
                const applicant =
                  application.user || application.applicant || {};
                const skills =
                  applicant.extractedSkills || applicant.skills || [];

                return (
                  <tr
                    key={application._id}
                    className="transition-colors hover:bg-surface-muted/60"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">
                        {applicant.username || applicant.name || 'Unknown applicant'}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {applicant.email || 'No email provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="text-xs text-ink-subtle">
                              +{skills.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-ink-subtle">
                          No skills listed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {formatDate(
                        application.appliedAt || application.createdAt
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <ApplicationStatusBadge status={application.status} />
                        <select
                          value={application.status}
                          onChange={(e) =>
                            handleStatusUpdate(application._id, e.target.value)
                          }
                          disabled={updatingStatus === application._id}
                          className="w-36 rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs text-ink transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {updatingStatus === application._id && (
                          <span className="text-xs text-ink-subtle">
                            Updating…
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {application.coverLetter ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCoverLetter({
                              applicantName:
                                applicant.username ||
                                applicant.name ||
                                'Applicant',
                              text: application.coverLetter,
                            })
                          }
                          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                        >
                          View letter
                        </button>
                      ) : (
                        <span className="text-sm text-ink-subtle">
                          No cover letter
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {applicants.length > 0 && (
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
      )}

      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-2xl border border-line bg-surface p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  Cover letter
                </h2>
                <p className="text-sm text-ink-muted">
                  {selectedCoverLetter.applicantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoverLetter(null)}
                className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
              >
                Close
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink-muted">
              {selectedCoverLetter.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
