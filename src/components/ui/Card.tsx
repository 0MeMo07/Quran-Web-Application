import React from 'react';
import { Card as HeroCard } from '@heroui/react';
import { cn } from './cn';

type HeroCardProps = React.ComponentProps<typeof HeroCard>;

export interface CardProps extends Omit<HeroCardProps, 'className' | 'children'> {
  /** Glassmorphic style with backdrop blur */
  glass?: boolean;
  /** Remove the default shadow */
  flat?: boolean;
  /** Add hover shadow transition */
  hoverable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  className,
  glass = false,
  flat = false,
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <HeroCard
      as="div"
      shadow={flat ? 'none' : 'md'}
      radius="lg"
      classNames={{
        base: cn(
          'rounded-2xl overflow-visible',
          glass
            ? 'bg-surface/80 dark:bg-surface/40 backdrop-blur-xl border border-border'
            : 'bg-surface dark:bg-surface border border-border',
          hoverable && 'hover:shadow-xl transition-shadow duration-300',
          className
        ),
      }}
      {...props}
    >
      {children}
    </HeroCard>
  );
}
