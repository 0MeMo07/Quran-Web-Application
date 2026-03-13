import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700', className)}
      {...props}
    />
  );
}
