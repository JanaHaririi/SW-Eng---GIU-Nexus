import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setMessage('Password changed successfully.');
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Current password is incorrect.');
      } else {
        setError(err?.response?.data?.message || 'Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Change password
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Use a strong password — at least 6 characters.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="currentPassword"
            className="text-sm font-medium text-ink"
          >
            Current password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              autoComplete="current-password"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
            >
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-ink"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              autoComplete="new-password"
              required
              minLength={6}
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
            >
              {showNew ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Change password'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
