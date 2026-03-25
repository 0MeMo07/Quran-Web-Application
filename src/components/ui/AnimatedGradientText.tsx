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
 * Shimmering theme-aware gradient text with subtle animation.
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
        'inline-block bg-gradient-to-r from-primary via-accent to-primary',
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
