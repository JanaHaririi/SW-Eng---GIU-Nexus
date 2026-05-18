import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Spinner from "../components/spinner";
import CategoryBadge from "../components/categoryBadge";
import ApplicationStatusBadge from "../components/applicationStatusBadge";
import SaveJobButton from "../components/saveJobButton";

import { getJobById, applyToJob } from "../services/jobService";

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);

      const data = await getJobById(id);

      setJob(data.job || data);

      if (data.applicationStatus) {
        setApplicationStatus(data.applicationStatus);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);

      await applyToJob(id, {
        coverLetter,
      });

      setApplicationStatus("pending");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
        "Failed to apply"
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {job.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Posted by {job.createdBy?.username || "Unknown recruiter"}
            </p>

            <p className="mt-2 text-lg text-slate-600">
              {job.company}
            </p>
          </div>

          <SaveJobButton job={job} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {job.type}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {job.location}
          </span>

          {job.category && (
            <CategoryBadge category={job.category} />
          )}
        </div>

        {job.salary && (
          <p className="mt-6 text-lg font-medium text-slate-800">
            Salary: {job.salary}
          </p>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-line text-slate-700">
            {job.description}
          </p>
        </div>

        {job.requirements?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">
              Requirements
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {job.requirements.map((req, index) => (
                <li key={index}>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          {applicationStatus ? (
            <ApplicationStatusBadge
              status={applicationStatus}
            />
          ) : (
            <div className="space-y-4">
              <textarea
                placeholder="Optional cover letter"
                value={coverLetter}
                onChange={(e) =>
                  setCoverLetter(e.target.value)
                }
                className="min-h-32 w-full rounded-xl border border-slate-300 p-4"
              />

              <button
                onClick={handleApply}
                disabled={applying}
                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}