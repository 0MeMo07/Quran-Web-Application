import React from 'react';
import { Spinner as HeroSpinner } from '@heroui/react';
import { cn } from './cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'current' | 'white';
  label?: string;
  className?: string;
  /** Center the spinner in its container */
  centered?: boolean;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  label,
  className,
  centered = false,
}: SpinnerProps) {
  if (centered) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <HeroSpinner size={size} color={color} />
        {label && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        )}
      </div>
    );
  }

  return (
    <HeroSpinner
      size={size}
      color={color}
      label={label}
      className={className}
    />
  );
}
