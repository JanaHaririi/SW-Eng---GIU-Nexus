import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Spinner from '../components/spinner';
import JobCard from '../components/jobCard';

import { getSavedJobs } from '../services/jobService';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await getSavedJobs();
      setJobs(data.jobs || data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Bookmarked
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Saved jobs
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Jobs you've bookmarked for later. Click into any one to apply.
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

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">No saved jobs yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Browse open positions and tap <strong>Save</strong> on the ones you
            want to revisit.
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Browse jobs →
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
