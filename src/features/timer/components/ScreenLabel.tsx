interface ScreenLabelProps {
  children: string;
  tone?: 'default' | 'warn' | 'accent';
}

const TONES = {
  default: 'text-fg-secondary',
  warn: 'text-warn',
  accent: 'text-accent',
} as const;

export function ScreenLabel({ children, tone = 'default' }: ScreenLabelProps) {
  return (
    <p className={`text-xs font-medium uppercase tracking-[0.35em] ${TONES[tone]}`}>{children}</p>
  );
}
