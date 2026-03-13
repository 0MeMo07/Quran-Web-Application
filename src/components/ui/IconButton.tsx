import React from 'react';
import { Button, type ButtonProps } from './Button';

interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
  icon: React.ReactNode;
}

export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <Button size="icon" {...props}>
      {icon}
    </Button>
  );
}
