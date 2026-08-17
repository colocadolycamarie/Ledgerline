import { getListBudgetsQueryKey, useListBudgets, type Budget } from '@workspace/api-client-react';
import { useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { BudgetBar } from '@/components/budget-bar';
import { EmptyState, ErrorState, LoadingRows } from '@/components/async-states';
import { Money } from '@/components/money';
import { PageTitle } from '@/components/page-title';
import { SectionHeader } from '@/components/section-header';

export function BudgetsPage() {
  const budgetsQuery = useListBudgets({ query: { queryKey: getListBudgetsQueryKey() } });
  const budgets = budgetsQuery.data ?? [];
  const grouped = useMemo(
    () =>
      budgets.reduce<Record<string, Budget[]>>((accumulator, budget) => {
        (accumulator[budget.department] ??= []).push(budget);
        return accumulator;
      }, {}),
    [budgets],
  );

  return (
    <AppShell>
      <PageTitle
        eyebrow="Control / department allocation"
        title="Budgets"
        detail="Consumption is shown against the published limit for each department and period. Bars change character as the line gets close."
      />
      {budgetsQuery.isLoading ? (
        <LoadingRows count={6} />
      ) : budgetsQuery.isError ? (
        <ErrorState onRetry={() => budgetsQuery.refetch()} />
      ) : budgets.length === 0 ? (
        <EmptyState title="No budget lines have been published." detail="Once departments receive an allocation, finance can watch consumption here." />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([department, entries]) => (
            <section key={department}>
              <SectionHeader eyebrow={`Department / ${department}`} title={`${department} allocation`} detail={`${entries.length} active budget ${entries.length === 1 ? 'line' : 'lines'}`} />
              <div className="border-t-2 border-[var(--color-line-strong)] bg-[var(--color-surface)]">
                <div className="hidden grid-cols-[1.3fr_0.7fr_0.8fr_1fr] border-b border-[var(--color-line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] md:grid">
                  <span>Budget line</span><span>Period</span><span>Consumed</span><span>Remaining</span>
                </div>
                {entries.map((budget) => {
                  const percentage = budget.limit ? Math.round((budget.spent / budget.limit) * 100) : 0;
                  const tone = percentage >= 100 ? 'negative' : percentage >= 80 ? 'pending' : 'positive';
                  return (
                    <div className="ledger-row grid gap-4 px-4 py-5 md:grid-cols-[1.3fr_0.7fr_0.8fr_1fr] md:items-center" key={budget.id} data-testid={`row-budget-${budget.id}`}>
                      <div>
                        <div className="font-semibold">{budget.name}</div>
                        <div className="mt-1 md:hidden"><BudgetBar spent={budget.spent} limit={budget.limit} /></div>
                      </div>
                      <div className="mono-data text-xs text-[var(--color-ink-muted)]">{budget.period}</div>
                      <div>
                        <div className="mono-data text-sm font-semibold" style={{ color: tone === 'negative' ? 'var(--color-negative)' : tone === 'pending' ? 'var(--color-pending)' : 'var(--color-positive)' }}>
                          <Money amount={budget.spent} /> / <Money amount={budget.limit} />
                        </div>
                        <div className="mt-2 hidden md:block"><BudgetBar spent={budget.spent} limit={budget.limit} /></div>
                      </div>
                      <div className="flex items-baseline justify-between gap-4 md:block">
                        <span className="text-xs text-[var(--color-ink-muted)] md:hidden">Remaining</span>
                        <Money amount={Math.max(0, budget.limit - budget.spent)} className={`text-sm font-semibold ${percentage >= 100 ? 'text-[var(--color-negative)]' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
