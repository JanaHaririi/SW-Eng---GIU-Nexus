import { useEffect, useState } from "react";

import Spinner from "../../components/Spinner";

import {
  getAllJobs,
  deleteJob,
} from "../../services/adminService";

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      await deleteJob(jobId);

      setJobs((prevJobs) =>
        prevJobs.filter((job) => job._id !== jobId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">
        Admin Jobs
      </h1>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border rounded-lg p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {job.title}
                </h2>

                <p className="text-gray-600">
                  {job.company}
                </p>

                <p className="mt-2">
                  Status: {job.status}
                </p>
              </div>

              <button
                onClick={() => handleDelete(job._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminJobsPage;