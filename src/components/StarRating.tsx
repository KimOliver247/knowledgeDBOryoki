import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => onChange(rating)}
          className={`p-1 transition-colors ${disabled ? 'cursor-default' : 'hover:text-[#59140b] cursor-pointer'}`}
        >
          <Star
            className={`w-6 h-6 ${
              rating <= value
                ? 'fill-[#59140b] text-[#59140b]'
                : 'fill-transparent text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}