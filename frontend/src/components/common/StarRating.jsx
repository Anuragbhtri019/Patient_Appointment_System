import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
}) {
  const [hoveredValue, setHoveredValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex gap-1">
      {stars.map((star) => {
        const isFilled = star <= (hoveredValue || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onMouseEnter={() => !readonly && setHoveredValue(star)}
            onMouseLeave={() => !readonly && setHoveredValue(0)}
            onClick={() => !readonly && onChange?.(star)}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            {isFilled ? (
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            ) : (
              <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
