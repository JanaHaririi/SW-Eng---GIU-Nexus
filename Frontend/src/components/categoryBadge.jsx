const CATEGORY_STYLES = {
  Frontend: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Backend: 'bg-sky-100 text-sky-800 ring-sky-200',
  'AI/ML': 'bg-violet-100 text-violet-800 ring-violet-200',
  DevOps: 'bg-teal-100 text-teal-800 ring-teal-200',
  'Data Engineering': 'bg-orange-100 text-orange-800 ring-orange-200',
  Other: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function CategoryBadge({ category }) {
  const label = category || 'Other';
  const classes = CATEGORY_STYLES[label] || CATEGORY_STYLES.Other;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}
