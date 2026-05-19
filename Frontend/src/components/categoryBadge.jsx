import { categoryColors } from '../utils/categoryColors';

export default function CategoryBadge({ category }) {
  const badgeColor = categoryColors[category] || categoryColors.Other;

  return (
    <span
      className="category-badge"
      style={{ backgroundColor: badgeColor }}
    >
      {category || 'Other'}
    </span>
  );
}
