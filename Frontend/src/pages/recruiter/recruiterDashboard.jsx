import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import Spinner from '../../components/spinner';
import JobCard from '../../components/jobCard';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/my-jobs');
      setJobs(response.data.jobs || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load your job posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.status === 'pending') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="text-base font-semibold">Pending admin approval</p>
          <p className="mt-2 text-sm">
            Your account is awaiting approval from an administrator. You can't
            create or manage job posts until your account is approved.
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Please check back later or contact support if you have questions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={fetchMyJobs}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalApplicants = jobs.reduce(
    (sum, job) => sum + (job.applicantCount || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Recruiter
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            Your dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your job posts and applicants.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
        >
          + Post new job
        </Link>
      </div>

      {/* Stat strip */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
            Total job posts
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">
            {jobs.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
            Total applicants
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">
            {totalApplicants}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-ink">
          Your job posts
        </h2>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">
              You haven't posted any jobs yet
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Get your first opening in front of GIU students.
            </p>
            <Link
              to="/recruiter/jobs/new"
              className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Create your first job posting →
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <JobCard
                  job={job}
                  showSaveButton={false}
                  onDelete={(deletedId) =>
                    setJobs((prev) => prev.filter((j) => j._id !== deletedId))
                  }
                />

                <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                  <span className="text-ink-muted">
                    Applicants:{' '}
                    <span className="font-semibold text-ink">
                      {job.applicantCount || 0}
                    </span>
                  </span>
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    View applicants →
                  </Link>
                </div>

                <Link
                  to={`/recruiter/jobs/${job._id}/edit`}
                  className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
                >
                  Edit job
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RecruiterDashboard;
