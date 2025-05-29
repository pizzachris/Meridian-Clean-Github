import React from 'react';
import { useProgressTracking } from '../../hooks/useProgressTracking';

interface ProgressTrackerProps {
  current: number;
  total: number;
  category: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps & { label: string }> = ({ current, total, label, category }) => {
  useProgressTracking(current, total, category);
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {/* Progress Label and Count */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[var(--gold-primary)] font-serif text-base">{label}</span>
        <span className="text-[var(--gold-primary)] font-serif text-base">{current}/{total}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-black h-5 rounded border border-[var(--gold-primary)]">
        <div
          className="h-full bg-[#7B2323] rounded transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressTracker;
