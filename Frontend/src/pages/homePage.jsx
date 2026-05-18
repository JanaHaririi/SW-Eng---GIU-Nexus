import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import JobCard from "../components/JobCard";
import Skeleton from "../components/Skeleton";

import {
  getJobs,
  getRecommendedJobs,
} from "../services/jobService";

import { AuthContext } from "../context/AuthContext";

const HomePage = () => {
  const { user, isAuthenticated } =
    useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRecommended, setLoadingRecommended] =
    useState(true);

  useEffect(() => {
    fetchJobs();

    if (
      isAuthenticated &&
      user?.role === "jobSeeker"
    ) {
      fetchRecommendedJobs();
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();

      setJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const data = await getRecommendedJobs();

      setRecommendedJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">

      {/* HERO */}
      <div className="rounded-2xl bg-blue-600 text-white p-8 mb-10">
        <h1 className="text-4xl font-bold mb-4">
          Find Your Dream Job
        </h1>

        <p className="text-lg text-blue-100">
          Discover opportunities that match your
          skills and career goals.
        </p>
      </div>

      {/* TRENDING JOBS */}
      <div className="mb-10">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Trending Jobs
          </h2>

          <Link
            to="/jobs"
            className="text-blue-600 font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        {loadingJobs ? (
          <Skeleton
            rows={4}
            className="h-40 w-full"
          />
        ) : (
          <div className="grid gap-5">
            {jobs.slice(0, 5).map((job) => (
              <JobCard
                key={job._id}
                job={job}
              />
            ))}
          </div>
        )}

      </div>

      {/* RECOMMENDED JOBS */}
      {isAuthenticated &&
        user?.role === "jobSeeker" && (
          <div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Recommended For You
              </h2>

              <Link
                to="/recommended"
                className="text-blue-600 font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            {loadingRecommended ? (
              <Skeleton
                rows={3}
                className="h-40 w-full"
              />
            ) : recommendedJobs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-slate-600 mb-3">
                  No recommendations found yet.
                </p>

                <Link
                  to="/profile"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Add skills to your profile
                </Link>
              </div>
            ) : (
              <div className="grid gap-5">
                {recommendedJobs
                  .slice(0, 3)
                  .map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      showScore={true}
                    />
                  ))}
              </div>
            )}

          </div>
        )}

    </div>
  );
};

export default HomePage;