'use client';

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export default function Progress({
  value,
  max = 100,
  className,
  size = 'md',
  showPercentage = false,
  color = 'blue',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('transition-all duration-300 ease-out', colorClasses[color], sizeClasses[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{Math.round(percentage)}%</span>
          <span className="text-xs text-gray-500">
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}