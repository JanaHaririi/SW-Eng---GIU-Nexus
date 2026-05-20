import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // Swallow errors so we don't reveal whether the email exists.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-7 shadow-md">
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            If an account with that email exists, a reset link has been sent.
            Check your inbox.
          </div>
          <p className="text-center text-sm text-ink-muted">
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Back to log in
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-md"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="you@student.giu-uni.de"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      {!submitted && (
        <p className="text-center text-sm text-ink-muted">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
