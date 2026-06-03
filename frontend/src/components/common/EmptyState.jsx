import Button from './Button';

export default function EmptyState({
  icon: Icon,
  heading,
  subtext,
  ctaText,
  onCtaClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && <Icon className="w-16 h-16 text-gray-400 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{heading}</h3>
      {subtext && <p className="text-gray-600 text-center mb-6 max-w-md">{subtext}</p>}
      {ctaText && onCtaClick && (
        <Button onClick={onCtaClick}>{ctaText}</Button>
      )}
    </div>
  );
}
