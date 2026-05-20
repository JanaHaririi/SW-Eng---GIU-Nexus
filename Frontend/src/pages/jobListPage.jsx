import { useEffect, useState } from 'react';
import JobCard from '../components/jobCard';
import Spinner from '../components/spinner';
import { getJobs } from '../services/jobService';
import { useAuth } from '../context/authContext';

const inputClasses =
  'rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]';

export default function JobListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    type: '',
    status: isAdmin ? '' : 'open',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs(filters);
      setJobs(data.jobs || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Opportunities
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Browse jobs
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Search by keyword, filter by type and location, and apply in one click.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className={`mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5 ${
          isAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4'
        }`}
      >
        <input
          type="text"
          name="keyword"
          placeholder="Keyword"
          value={filters.keyword}
          onChange={handleChange}
          className={inputClasses}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
          className={inputClasses}
        />
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className={inputClasses}
        >
          <option value="">All types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>

        {isAdmin && (
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        )}

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
        >
          Search
        </button>
      </form>

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
          <p className="text-base font-semibold text-ink">No jobs found</p>
          <p className="mt-1 text-sm text-ink-muted">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={(deletedId) =>
                setJobs((prev) => prev.filter((j) => j._id !== deletedId))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
