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
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50'
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
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
