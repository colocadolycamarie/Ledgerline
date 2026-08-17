import { type ReactNode } from 'react';

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = 'button',
  testId = 'button-primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  testId?: string;
}) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--color-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-paper)] hover:bg-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40" disabled={disabled} onClick={onClick} type={type} data-testid={testId}>
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  disabled,
  onClick,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  testId: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink)] hover:border-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40" disabled={disabled} onClick={onClick} type={type} data-testid={testId}>
      {children}
    </button>
  );
}
