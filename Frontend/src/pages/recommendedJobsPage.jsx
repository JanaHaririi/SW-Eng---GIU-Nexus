import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import JobCard from '../components/jobCard';
import Skeleton from '../components/skeleton';

import { getRecommendedJobs } from '../services/jobService';

const RecommendedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const data = await getRecommendedJobs();
      setJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Personalized
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Recommended jobs
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ranked by AI similarity between your skills and each job's requirements.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">
            No recommendations yet
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Update your bio with the skills you have, then click{' '}
            <strong>Extract Skills</strong> on your profile.
          </p>
          <Link
            to="/profile"
            className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Go to profile →
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} showScore={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobsPage;
