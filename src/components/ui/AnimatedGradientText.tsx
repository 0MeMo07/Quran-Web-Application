import React from 'react';
import { cn } from './cn';

export interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Use Arabic font */
  arabic?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Magic UI — AnimatedGradientText
 * Shimmering emerald-to-teal gradient text with subtle animation.
 * Great for surah names and section headings.
 */
export function AnimatedGradientText({
  children,
  className,
  arabic = false,
  as: Tag = 'span',
}: AnimatedGradientTextProps) {
  return (
    <Tag
      className={cn(
        'inline-block bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400',
        'dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500',
        'bg-[length:200%_auto] bg-clip-text text-transparent',
        'animate-[gradient-pan_3s_linear_infinite]',
        arabic && 'font-arabic',
        className
      )}
    >
      {children}
    </Tag>
  );
}
