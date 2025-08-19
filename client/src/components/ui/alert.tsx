import React, { HTMLAttributes } from 'react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {}

export function Alert({ className = '', children, ...props }: AlertProps) {
  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

export function AlertDescription({ className = '', children, ...props }: AlertDescriptionProps) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}