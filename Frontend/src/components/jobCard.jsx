import { Link } from "react-router-dom";
import CategoryBadge from "./categoryBadge";
import SaveJobButton from "./saveJobButton";

export default function JobCard({ job, onSaveToggle }) {
  if (!job) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {job.title}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {job.company}
          </p>
        </div>

        <SaveJobButton
          job={job}
          onToggle={onSaveToggle}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {job.type}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {job.location}
        </span>

        {job.category && (
          <CategoryBadge category={job.category} />
        )}
      </div>

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