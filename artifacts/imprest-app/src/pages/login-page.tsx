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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--color-canvas-dark)] p-4 sm:p-10">
      {/* Rounded, diagonally-cut clip shape reused by the photo panel below */}
      <svg aria-hidden="true" height="0" width="0">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id="imprest-photo-clip">
            <path d="M0.035,0 L0.935,0 Q0.97,0 0.9635,0.0344 L0.7865,0.9656 Q0.78,1 0.745,1 L0.035,1 Q0,1 0,0.965 L0,0.035 Q0,0 0.035,0 Z" />
          </clipPath>
        </defs>
      </svg>
      {/* Backdrop — same photo, dimmed, split on a diagonal against paper (composition only) */}
      <div className="absolute inset-0 bg-[var(--color-canvas-dark)]">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-50 [filter:grayscale(0.35)_sepia(0.4)_contrast(1.05)_brightness(0.6)_blur(2px)]"
          src={LEDGER_PHOTO_URL}
        />
      </div>
      <div className="absolute inset-0 bg-[var(--color-paper)] [clip-path:polygon(68%_0,100%_0,100%_100%,58%_100%)]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-[var(--color-paper)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] lg:grid-cols-[1.3fr_1fr]">
        {/* Left panel — photo card with the existing wordmark top-left and the
            existing pull-quote + caption repositioned to the bottom, per the
            reference composition. No content added. */}
        <div className="relative hidden bg-[var(--color-paper)] p-4 lg:block">
          <div className="relative h-full w-full overflow-hidden bg-[var(--color-canvas-dark)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] [clip-path:url(#imprest-photo-clip)]">
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-70 [filter:grayscale(0.35)_sepia(0.4)_contrast(1.05)_brightness(0.75)]"
              src={LEDGER_PHOTO_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-canvas-dark)] via-[rgba(30,26,20,0.15)] to-[rgba(30,26,20,0.55)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(30,26,20,0.55)] via-transparent to-transparent" />

            <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
              <div className="flex items-center justify-between gap-2.5 pr-6 xl:pr-8">
                <div className="flex items-center gap-2.5">
                  <svg aria-hidden="true" height="22" viewBox="0 0 22 22" width="22">
                    <circle cx="11" cy="11" fill="none" r="9" stroke="rgba(245,241,232,0.25)" strokeWidth="2.5" />
                    <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-brass)" strokeDasharray="56.5" strokeDashoffset="18" strokeLinecap="round" strokeWidth="2.5" transform="rotate(-90 11 11)" />
                  </svg>
                  <span className="font-serif text-2xl leading-none text-[var(--color-paper)]">Imprest</span>
                </div>
                <button
                  className="rounded-full border border-[rgba(245,241,232,0.5)] bg-[rgba(30,26,20,0.35)] px-4 py-1.5 text-xs font-semibold text-[var(--color-paper)] backdrop-blur-sm transition-colors hover:border-[var(--color-paper)] hover:bg-[rgba(30,26,20,0.5)]"
                  onClick={() => {
                    setError('');
                    setMode(mode === 'sign-in' ? 'register' : 'sign-in');
                  }}
                  type="button"
                  data-testid="button-toggle-auth-mode-panel"
                >
                  {mode === 'sign-in' ? 'Create one' : 'Sign in'}
                </button>
              </div>

              <div className="max-w-md">
                <p className="font-serif text-[26px] italic leading-snug text-[var(--color-paper)]">
                  &ldquo;Every advance, accounted for.&rdquo;
                </p>
                <p className="mono-data mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-on-dark)]">
                  Submissions · Approvals · Budgets — one workspace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — the form. Mode toggle now sits top-right of this
            panel (reference composition), the heading is centered and
            enlarged, and the Login/Sign up CTA sits directly under the
            fields since there is no divider/social-login content to keep. */}
        <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <svg aria-hidden="true" height="18" viewBox="0 0 22 22" width="18">
                <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-line)" strokeWidth="2.5" />
                <circle cx="11" cy="11" fill="none" r="9" stroke="var(--color-brass)" strokeDasharray="56.5" strokeDashoffset="18" strokeLinecap="round" strokeWidth="2.5" transform="rotate(-90 11 11)" />
              </svg>
              <span className="mono-data text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent)]">Imprest</span>
            </div>
            <button
              className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink-muted)]"
              onClick={() => {
                setError('');
                setMode(mode === 'sign-in' ? 'register' : 'sign-in');
              }}
              type="button"
              data-testid="button-toggle-auth-mode-panel"
            >
              {mode === 'sign-in' ? 'Create one' : 'Sign in'}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center py-6">
            <div className="w-full max-w-sm">
              <h1 className="text-center font-serif text-[34px] leading-tight">
                {mode === 'sign-in' ? 'Sign in to your float.' : 'Open a new account.'}
              </h1>
              <p className="mt-2 text-center text-sm text-[var(--color-ink-muted)]">
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

                <div className="flex [&>button]:w-full">
                  <PrimaryButton disabled={isPending} testId="button-submit-auth" type="submit">
                    {isPending ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </PrimaryButton>
                </div>
              </form>

              {/* Only the actual link text is clickable — not the whole sentence. */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[var(--color-ink-muted)]">
                {mode === 'sign-in' ? (
                  <>
                    <span>Don&rsquo;t have an account?</span>
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
                    <span>Already have an account?</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}