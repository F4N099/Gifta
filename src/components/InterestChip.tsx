import React from 'react';

interface InterestChipProps {
  interest: string;
  onClick: () => void;
  isSelected?: boolean;
}

const InterestChip: React.FC<InterestChipProps> = ({ interest, onClick, isSelected }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${
        isSelected
          ? 'bg-rose-500 text-white hover:bg-rose-600'
          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20'
      }`}
    >
      {interest}
    </button>
  );
}

export default InterestChip;