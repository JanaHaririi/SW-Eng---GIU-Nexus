import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useAuth } from '../context/authContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTokenInvalid(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      if (data?.token && data?.user) {
        login(data.token, data.user);
      }
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Reset password failed';
      setError(msg);
      if (status === 400) {
        setTokenInvalid(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Choose a new password for your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-ink"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="Type your new password again"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <p>{error}</p>
            {tokenInvalid && (
              <p className="mt-2">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-red-700 underline"
                >
                  Request a new reset link
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Remembered your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
