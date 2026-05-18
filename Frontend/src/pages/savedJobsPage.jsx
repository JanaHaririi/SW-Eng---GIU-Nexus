import { useEffect, useState } from "react";

import Spinner from "../components/spinner";
import JobCard from "../components/jobCard";

import { getSavedJobs } from "../services/jobService";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);

      const data = await getSavedJobs();

      setJobs(data.jobs || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
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
        Saved Jobs
      </h1>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <p className="text-slate-600">
          No saved jobs yet.
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