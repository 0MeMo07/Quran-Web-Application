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
          color === 'primary' && variant === 'solid' && 'bg-primary text-primary-foreground',
          color === 'primary' && variant === 'flat' && 'bg-accent text-primary dark:bg-primary/20 dark:text-primary',
          color === 'default' && variant === 'solid' && 'bg-secondary text-foreground dark:bg-surface dark:text-foreground',
          color === 'default' && variant === 'flat' && 'bg-muted/30 text-muted-foreground dark:bg-surface/50 dark:text-muted-foreground',
          color === 'secondary' && variant === 'solid' && 'bg-secondary text-foreground border border-border',
          color === 'secondary' && variant === 'flat' && 'bg-secondary/50 text-foreground dark:bg-secondary/20',
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
