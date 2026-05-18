// Minimal fallback stub. Replace with the real implementation in the Profile team's PR.
export default function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {category}
    </span>
  );
}
