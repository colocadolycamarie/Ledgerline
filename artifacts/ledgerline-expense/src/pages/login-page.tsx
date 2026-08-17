import { getGetCurrentUserQueryKey, useLogin, useRegister } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { PrimaryButton } from '@/components/buttons';

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
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm border-t-2 border-[var(--color-line-strong)] pt-7">
        <div className="mono-data text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent)]">Ledgerline</div>
        <h1 className="mt-2 font-serif text-[32px] leading-tight">
          {mode === 'sign-in' ? 'Sign in to the ledger.' : 'Create an account.'}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {mode === 'sign-in' ? 'Use your workspace email and password.' : 'You will be signed in immediately after.'}
        </p>

        <form className="mt-7 space-y-5" onSubmit={onSubmit}>
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

        <button
          className="mt-6 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          onClick={() => {
            setError('');
            setMode((current) => (current === 'sign-in' ? 'register' : 'sign-in'));
          }}
          type="button"
          data-testid="button-toggle-auth-mode"
        >
          {mode === 'sign-in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
