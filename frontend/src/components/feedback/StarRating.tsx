import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverValue !== null ? hoverValue : value) >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none`}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : 'text-slate-300 dark:text-slate-700'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {!readOnly && (hoverValue || value) > 0 && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
          {labels[hoverValue || value]}
        </span>
      )}
    </div>
  );
};
