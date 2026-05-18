import { useEffect, useState } from "react";
import JobCard from "../components/jobCard";
import Spinner from "../components/spinner";
import { getJobs } from "../services/jobService";
import { useAuth } from "../context/authContext";

export default function JobListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    type: "",
    status: isAdmin ? "" : "open",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const data = await getJobs(filters);

      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs");
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

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Jobs
      </h1>

      <form
        onSubmit={handleSearch}
        className={`mb-8 grid gap-4 ${isAdmin ? "md:grid-cols-5" : "md:grid-cols-4"}`}
      >
        <input
          type="text"
          name="keyword"
          placeholder="Keyword"
          value={filters.keyword}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-4 py-2"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-4 py-2"
        />

        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="rounded-lg border border-slate-300 px-4 py-2"
        >
          <option value="">All Types</option>
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
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        )}

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <p className="text-slate-600">
          No jobs found.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
            />
          ))}
        </div>
      )}
    </div>
  );
}