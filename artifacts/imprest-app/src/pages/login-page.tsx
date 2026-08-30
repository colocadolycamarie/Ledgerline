import { getGetCurrentUserQueryKey, useLogin, useRegister } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { PrimaryButton } from '@/components/buttons';

// A real, on-theme photograph — an open ledger, handwritten notes — rather
// than an illustration or a stock "team high-fiving" shot. Treated with a
// duotone filter (below) so it sits inside Imprest's own palette regardless
// of the source photo's native color. Photo: camera obscura, Unsplash.
const LEDGER_PHOTO_URL =
  'https://images.unsplash.com/photo-1760307837453-ce60cb209e52?w=1400&h=1900&fit=crop&q=80&auto=format';

export function LoginPage() {
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [mode, setMode] = useState<'sign-in' | 'register'>('sign-in');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const onSuccess = (user: { id: string }) => {
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      queryClient.invalidateQueries();
    };

    if (mode === 'sign-in') {
      loginMutation.mutate(
        { data: { email: form.email, password: form.password } },
        {
          onSuccess,
          onError: () => setError('Incorrect email or password.'),
        },
      );
    } else {
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      registerMutation.mutate(
        { data: { name: form.name, email: form.email, password: form.password, department: form.department } },
        {
          onSuccess,
          onError: (mutationError) => {
            setError(
              mutationError instanceof Error && mutationError.message.includes('409')
                ? 'An account with this email already exists.'
                : 'Could not create the account. Check the details and try again.',
            );
          },
        },
      );
    }
  };

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Left panel — real photography, not an illustration, treated to sit
          inside Imprest's own palette. A dark scrim sits behind the
          wordmark and pull-quote specifically so both stay legible
          regardless of what's happening in the photo underneath. */}
      <div className="relative hidden overflow-hidden bg-[var(--color-canvas-dark)] lg:block">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-70 [filter:grayscale(0.35)_sepia(0.4)_contrast(1.05)_brightness(0.75)]"
          src={LEDGER_PHOTO_URL}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-canvas-dark)] via-[rgba(30,26,20,0.35)] to-[rgba(30,26,20,0.75)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(30,26,20,0.55)] via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-2.5">
            <svg aria-hidden="true" height="26" viewBox="0 0 22 22" width="26">
              <circle cx="11" cy="11" fill="none" r="9" stroke="rgba(245,241,232,0.25)" strokeWidth="2.5" />
              <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-brass)" strokeDasharray="56.5" strokeDashoffset="18" strokeLinecap="round" strokeWidth="2.5" transform="rotate(-90 11 11)" />
            </svg>
            <span className="font-serif text-2xl leading-none text-[var(--color-paper)]">Imprest</span>
          </div>
          <div className="max-w-md">
            <p className="font-serif text-[28px] italic leading-snug text-[var(--color-paper)] xl:text-[32px]">
              &ldquo;Every advance, accounted for.&rdquo;
            </p>
            <p className="mono-data mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-on-dark)]">
              Submissions · Approvals · Budgets — one workspace
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — the form itself. */}
      <div className="flex items-center justify-center bg-[var(--color-paper)] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-1 flex items-center gap-2 lg:hidden">
            <svg aria-hidden="true" height="18" viewBox="0 0 22 22" width="18">
              <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-line)" strokeWidth="2.5" />
              <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-brass)" strokeDasharray="56.5" strokeDashoffset="18" strokeLinecap="round" strokeWidth="2.5" transform="rotate(-90 11 11)" />
            </svg>
            <span className="mono-data text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent)]">Imprest</span>
          </div>

          <h1 className="mt-4 font-serif text-[32px] leading-tight lg:mt-0">
            {mode === 'sign-in' ? 'Sign in to your float.' : 'Open a new account.'}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {mode === 'sign-in' ? 'Use your workspace email and password.' : 'You will be signed in immediately after.'}
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            {mode === 'register' ? (
              <>
                <label className="block">
                  <span className="field-label">Full name</span>
                  <input className="field-input" onChange={(event) => updateField('name', event.target.value)} required value={form.name} data-testid="input-name" />
                </label>
                <label className="block">
                  <span className="field-label">Department</span>
                  <input className="field-input" onChange={(event) => updateField('department', event.target.value)} placeholder="e.g. Product" required value={form.department} data-testid="input-department" />
                </label>
              </>
            ) : null}
            <label className="block">
              <span className="field-label">Email</span>
              <input autoComplete="email" className="field-input" onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} data-testid="input-email" />
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <input autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className="field-input" minLength={mode === 'register' ? 8 : undefined} onChange={(event) => updateField('password', event.target.value)} required type="password" value={form.password} data-testid="input-password" />
            </label>

            {error ? <p className="border-l-2 border-[var(--color-negative)] px-3 py-2 text-sm text-[var(--color-negative)]" role="alert">{error}</p> : null}

            <PrimaryButton disabled={isPending} testId="button-submit-auth" type="submit">
              {isPending ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </PrimaryButton>
          </form>

          {/* Only the actual link text is clickable — not the whole sentence. */}
          <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
            {mode === 'sign-in' ? (
              <>
                Don&rsquo;t have an account?{' '}
                <button
                  className="font-semibold text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-2 transition-colors hover:text-[var(--color-accent-hover)] hover:decoration-[var(--color-accent-hover)]"
                  onClick={() => {
                    setError('');
                    setMode('register');
                  }}
                  type="button"
                  data-testid="button-toggle-auth-mode"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  className="font-semibold text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-2 transition-colors hover:text-[var(--color-accent-hover)] hover:decoration-[var(--color-accent-hover)]"
                  onClick={() => {
                    setError('');
                    setMode('sign-in');
                  }}
                  type="button"
                  data-testid="button-toggle-auth-mode"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
