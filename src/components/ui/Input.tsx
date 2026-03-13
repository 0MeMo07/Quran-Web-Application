import React from 'react';
import { Input as HeroInput } from '@heroui/react';
import { cn } from './cn';

type InputSize = 'sm' | 'md';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  /** Optional label shown above the input */
  label?: string;
  /** Optional description shown below */
  description?: string;
  /** Error message — also sets invalid styling */
  errorMessage?: string;
  isInvalid?: boolean;
  /** Leading content inside the input wrapper */
  startContent?: React.ReactNode;
  /** Trailing content inside the input wrapper */
  endContent?: React.ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
};

const wrapperSizeClasses: Record<InputSize, string> = {
  sm: 'h-9 min-h-9 px-2.5 rounded-lg',
  md: 'h-10 min-h-10 px-3 rounded-xl',
};

/**
 * Backward-compatible Input component.
 * Renders a plain styled <input> so that:
 *  - `type="range"` sliders work correctly
 *  - Compact inline layouts (flex rows, etc.) are not broken by wrapper divs
 *  - `onChange={(e) => e.target.value}` patterns work as expected
 *
 * When startContent/endContent are provided it wraps in a relative div.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    inputSize = 'md',
    label,
    description,
    errorMessage,
    isInvalid = false,
    startContent,
    endContent,
    type,
    color: nativeColor,
    size: nativeSize,
    spellCheck,
    value,
    defaultValue,
    ...props
  },
  ref
) {
  if (type === 'range') {
    return (
      <input
        ref={ref}
        type={type}
        color={nativeColor}
        size={nativeSize}
        value={value as string | number | readonly string[] | undefined}
        defaultValue={defaultValue as string | number | readonly string[] | undefined}
        className={cn(
          'w-full border-0 outline-none bg-transparent',
          className
        )}
        {...props}
      />
    );
  }

  const normalizedValue = Array.isArray(value)
    ? value.join(',')
    : typeof value === 'number'
      ? String(value)
      : value;
  const normalizedDefaultValue = Array.isArray(defaultValue)
    ? defaultValue.join(',')
    : typeof defaultValue === 'number'
      ? String(defaultValue)
      : defaultValue;
  const normalizedSpellCheck =
    typeof spellCheck === 'boolean' ? (spellCheck ? 'true' : 'false') : spellCheck;

  const heroInput = (
    <HeroInput
      ref={ref}
      type={type}
      size={inputSize === 'sm' ? 'sm' : 'md'}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      startContent={startContent}
      endContent={endContent}
      value={normalizedValue as string | undefined}
      defaultValue={normalizedDefaultValue as string | undefined}
      spellCheck={normalizedSpellCheck as 'true' | 'false' | undefined}
      classNames={{
        base: 'w-full',
        inputWrapper: cn(
          'bg-gray-100/70 dark:bg-gray-700/70 border border-gray-200/70 dark:border-gray-600/70 shadow-none',
          'group-data-[hover=true]:bg-gray-100 dark:group-data-[hover=true]:bg-gray-700',
          'group-data-[focus=true]:border-emerald-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-emerald-500/20',
          wrapperSizeClasses[inputSize],
          isInvalid && 'border-red-400 group-data-[focus=true]:border-red-500 group-data-[focus=true]:ring-red-400/20',
          className
        ),
        input: cn('text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500', sizeClasses[inputSize]),
        label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
        description: 'text-xs text-gray-500 dark:text-gray-400',
        errorMessage: 'text-xs text-red-500 dark:text-red-400',
      }}
      {...(props as Record<string, unknown>)}
    />
  );

  return heroInput;
});
