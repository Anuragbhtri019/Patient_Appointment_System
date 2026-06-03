export default function Skeleton({ variant = 'card' }) {
  const baseClass = 'bg-gray-200 animate-pulse';

  const variants = {
    card: `${baseClass} rounded-lg h-48 mb-4`,
    row: `${baseClass} h-12 rounded mb-2`,
    circle: `${baseClass} w-12 h-12 rounded-full`,
    text: `${baseClass} h-4 rounded w-3/4 mb-2`,
  };

  return <div className={variants[variant] || variants.card} />;
}
