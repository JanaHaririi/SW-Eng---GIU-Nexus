// Minimal fallback stub. Replace with the real implementation in the Search team's PR.
export default function JobCard({ job }) {
  if (!job) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
      {job.company && (
        <p className="text-sm text-slate-600">{job.company}</p>
      )}
      {job.location && (
        <p className="text-sm text-slate-500">{job.location}</p>
      )}
      {job.category && (
        <p className="mt-1 text-xs text-slate-500">Category: {job.category}</p>
      )}
    </div>
  );
}
