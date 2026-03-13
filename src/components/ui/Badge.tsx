import React from 'react';
import { Badge as HeroBadge } from '@heroui/react';
import { cn } from './cn';

type BadgeVariant = 'solid' | 'flat' | 'faded' | 'shadow';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';

export interface BadgeProps {
  content?: React.ReactNode;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  isDot?: boolean;
  isInvisible?: boolean;
  className?: string;
  /** Standalone badge (no children wrapper) */
  standalone?: boolean;
}

export function Badge({
  content,
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  placement = 'top-right',
  isDot = false,
  isInvisible = false,
  className,
  standalone = false,
}: BadgeProps) {
  if (standalone) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-2.5 py-0.5 text-sm',
          size === 'lg' && 'px-3 py-1 text-base',
          color === 'primary' && variant === 'solid' && 'bg-emerald-500 text-white',
          color === 'primary' && variant === 'flat' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          color === 'default' && variant === 'solid' && 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          color === 'default' && variant === 'flat' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
          color === 'secondary' && variant === 'solid' && 'bg-teal-500 text-white',
          color === 'secondary' && variant === 'flat' && 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
          className
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <HeroBadge
      content={content}
      variant={variant}
      color={color}
      size={size}
      placement={placement}
      isDot={isDot}
      isInvisible={isInvisible}
      className={className}
    >
      {children}
    </HeroBadge>
  );
}
