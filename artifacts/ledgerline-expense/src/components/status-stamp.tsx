import { AlertTriangle, Check, CircleDollarSign, ClipboardCheck, FileText, X } from 'lucide-react';

const statusStyles: Record<string, { icon: typeof Check; color: string; label: string }> = {
  APPROVED: { icon: Check, color: 'var(--color-positive)', label: 'Approved' },
  REIMBURSED: { icon: CircleDollarSign, color: 'var(--color-positive)', label: 'Reimbursed' },
  SUBMITTED: { icon: ClipboardCheck, color: 'var(--color-pending)', label: 'Submitted' },
  IN_REVIEW: { icon: ClipboardCheck, color: 'var(--color-pending)', label: 'In review' },
  CHANGES_REQUESTED: { icon: AlertTriangle, color: 'var(--color-pending)', label: 'Changes requested' },
  REJECTED: { icon: X, color: 'var(--color-negative)', label: 'Rejected' },
  DRAFT: { icon: FileText, color: 'var(--color-info)', label: 'Draft' },
};

export function StatusStamp({ status }: { status: string }) {
  const entry = statusStyles[status.toUpperCase()] ?? {
    icon: FileText,
    color: 'var(--color-ink-muted)',
    label: status.replaceAll('_', ' '),
  };
  const Icon = entry.icon;
  return (
    <span className="stamp" style={{ color: entry.color }} data-testid={`status-${status.toLowerCase()}`}>
      <Icon size={12} strokeWidth={1.5} aria-hidden="true" />
      {entry.label}
    </span>
  );
}
