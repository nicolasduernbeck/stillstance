import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-accent text-black hover:brightness-105',
  ghost: 'border border-line text-fg hover:border-fg-muted',
  danger: 'border border-danger/50 text-danger hover:border-danger',
};

interface ControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function ControlButton({ variant = 'ghost', className = '', ...props }: ControlButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-14 w-full rounded-full px-8 text-sm font-semibold uppercase tracking-[0.2em] transition
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent
        motion-safe:active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
