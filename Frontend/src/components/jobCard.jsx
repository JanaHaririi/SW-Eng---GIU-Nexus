import { Link } from "react-router-dom";
import CategoryBadge from "./categoryBadge";
import SaveJobButton from "./saveJobButton";

export default function JobCard({
  job,
  onSaveToggle,
  showScore = false,
}) {
  if (!job) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {job.title}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            by {job.createdBy?.username || "Unknown recruiter"}
          </p>
        </div>

        <SaveJobButton
          job={job}
          onToggle={onSaveToggle}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">

        {job.type && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {job.type}
          </span>
        )}

        {job.location && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {job.location}
          </span>
        )}

        {job.category && (
          <CategoryBadge category={job.category} />
        )}

        {showScore && job.score && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {job.score}% Match
          </span>
        )}

      </div>

      {job.description && (
        <p className="mt-4 text-sm text-slate-600 line-clamp-3">
          {job.description}
        </p>
      )}

      <div className="mt-5">
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Details
        </Link>
      </div>

    </div>
  );
}