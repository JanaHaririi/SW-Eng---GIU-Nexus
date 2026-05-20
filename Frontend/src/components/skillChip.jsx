export default function SkillChip({ skill }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-fg ring-1 ring-inset ring-[color:var(--color-primary)]/15">
      {skill}
    </span>
  );
}
