import { formatMoney } from '@/lib/format';

export function BudgetBar({ spent, limit }: { spent: number; limit: number }) {
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const width = Math.min(100, Math.max(0, percentage));
  const color = percentage >= 100 ? 'var(--color-negative)' : percentage >= 80 ? 'var(--color-pending)' : 'var(--color-positive)';
  return (
    <div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: `${width}%`, background: color }} />
      </div>
      <div className="mono-data mt-2 flex justify-between text-[10px] text-[var(--color-ink-muted)]">
        <span>{percentage}% consumed</span>
        <span>{formatMoney(Math.max(0, limit - spent))} remaining</span>
      </div>
    </div>
  );
}
