import React from 'react';
import { Button as HeroButton } from '@heroui/react';
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
    'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-sm shadow-emerald-500/20',
  soft:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700/70',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
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
  );
});
