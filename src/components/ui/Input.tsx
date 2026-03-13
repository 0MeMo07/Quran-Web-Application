import React from 'react';
import { cn } from './cn';

type InputSize = 'sm' | 'md';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-2 py-1 text-sm rounded',
  md: 'px-3 py-2 text-base rounded-lg',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, inputSize = 'md', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 outline-none',
        'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
        sizeClasses[inputSize],
        className
      )}
      {...props}
    />
  );
});
