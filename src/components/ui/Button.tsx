import React from 'react';
import { Button as HeroButton } from '@heroui/react';
import { motion } from 'framer-motion';
import { cn } from './cn';

type ButtonVariant = 'solid' | 'soft' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm shadow-primary/20',
  soft:
    'bg-secondary text-foreground hover:bg-secondary/80 active:bg-secondary/70',
  ghost:
    'bg-transparent text-foreground hover:bg-secondary/50 active:bg-secondary/70',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  icon: 'p-2 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'soft',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    startContent,
    endContent,
    type = 'button',
    disabled,
    value,
    children,
    ...props
  },
  ref
) {
  const isIconOnly = size === 'icon' && !children;
  const heroVariant: 'solid' | 'flat' | 'light' =
    variant === 'solid' ? 'solid' : variant === 'soft' ? 'flat' : 'light';
  const normalizedValue: string | undefined = Array.isArray(value)
    ? value.join(',')
    : typeof value === 'number'
      ? String(value)
      : (value as string | undefined);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(fullWidth && 'w-full')}
    >
      <HeroButton
        ref={ref}
        type={type}
        isDisabled={disabled || isLoading}
        isLoading={isLoading}
        isIconOnly={isIconOnly}
        value={normalizedValue}
        startContent={!isLoading ? startContent : undefined}
        endContent={!isLoading ? endContent : undefined}
        fullWidth={fullWidth}
        size={size === 'sm' ? 'sm' : 'md'}
        variant={heroVariant}
        className={cn(
          'inline-flex items-center justify-center',
          'font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isIconOnly && 'min-w-0',
          className
        )}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </HeroButton>
    </motion.div>
  );
});
