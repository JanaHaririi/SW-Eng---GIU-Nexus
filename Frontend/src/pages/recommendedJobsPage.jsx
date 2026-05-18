import { useEffect, useState } from "react";

import JobCard from "../components/JobCard";
import Skeleton from "../components/Skeleton";

import { getRecommendedJobs } from "../services/jobService";

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-3xl font-bold">
          Recommended Jobs
        </h1>

        <Skeleton
          rows={5}
          className="h-40 w-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Recommended Jobs
        </h1>

        <p className="mt-2 text-slate-600">
          Jobs matched to your skills and profile
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-600">
            No recommended jobs found.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              showScore={true}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default RecommendedJobsPage;