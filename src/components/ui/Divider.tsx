import React from 'react';
import { Divider as HeroDivider } from '@heroui/react';
import { cn } from './cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Show an Arabic star ornament in the center */
  ornament?: boolean;
  className?: string;
  label?: string;
}

const STAR_ORNAMENT = '✦';

export function Divider({
  orientation = 'horizontal',
  ornament = false,
  className,
  label,
}: DividerProps) {
  if (ornament || label) {
    return (
      <div className={cn('flex items-center gap-3 w-full my-2', className)}>
        <HeroDivider className="flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-emerald-500/70 dark:text-emerald-400/60 text-sm select-none shrink-0">
          {label || STAR_ORNAMENT}
        </span>
        <HeroDivider className="flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <HeroDivider
      orientation={orientation}
      className={cn('bg-gray-200 dark:bg-gray-700', className)}
    />
  );
}
