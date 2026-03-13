import React from 'react';
import { Button as HeroButton, Tooltip as HeroTooltip } from '@heroui/react';
import { cn } from './cn';

type IconButtonVariant = 'solid' | 'soft' | 'ghost';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  isLoading?: boolean;
}

const variantClasses: Record<IconButtonVariant, string> = {
  solid:
    'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-500/20',
  soft:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700/70',
};

const sizeClasses = {
  sm: 'p-1.5 rounded-md',
  md: 'p-2 rounded-lg',
  lg: 'p-2.5 rounded-xl',
};

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  tooltip,
  isLoading = false,
  className,
  disabled,
  type = 'button',
  value,
  ...props
}: IconButtonProps) {
  const heroVariant: 'solid' | 'flat' | 'light' =
    variant === 'solid' ? 'solid' : variant === 'soft' ? 'flat' : 'light';
  const normalizedValue: string | undefined = Array.isArray(value)
    ? value.join(',')
    : typeof value === 'number'
      ? String(value)
      : (value as string | undefined);

  const trigger = (
    <HeroButton
      type={type}
      isIconOnly
      isLoading={isLoading}
      isDisabled={disabled || isLoading}
      value={normalizedValue}
      aria-label={tooltip}
      title={tooltip}
      variant={heroVariant}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className={cn(
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      {icon}
    </HeroButton>
  );

  if (!tooltip) {
    return trigger;
  }

  return (
    <HeroTooltip content={tooltip} placement="top" delay={250}>
      {trigger}
    </HeroTooltip>
  );
}
