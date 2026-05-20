import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { updateEmail, deleteAccount } from '../services/profileService';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="space-y-6">
        <AppearanceSection theme={theme} toggleTheme={toggleTheme} />
        <AccountSection user={user} onEmailChanged={updateUser} />
        <DangerSection
          onDeleted={async () => {
            await logout();
            navigate('/register', { replace: true });
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================ */
/* Appearance                                                    */
/* ============================================================ */

function AppearanceSection({ theme, toggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <SettingsCard
      title="Appearance"
      description="Change how GIU Nexus looks on this device."
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">Theme</p>
          <p className="text-xs text-ink-muted">
            Currently using{' '}
            <span className="font-semibold text-ink">
              {isDark ? 'Dark' : 'Light'}
            </span>{' '}
            mode.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-line-strong transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--color-focus-ring)] ${
            isDark ? 'bg-primary' : 'bg-surface-muted'
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isDark ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </SettingsCard>
  );
}

/* ============================================================ */
/* Account                                                       */
/* ============================================================ */

function AccountSection({ user, onEmailChanged }) {
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <SettingsCard
      title="Account"
      description="Update the credentials you sign in with."
    >
      <div className="divide-y divide-line">
        <SettingsRow
          label="Email"
          value={user?.email || '—'}
          actionLabel={emailOpen ? 'Close' : 'Change'}
          onAction={() => setEmailOpen((v) => !v)}
        />

        {emailOpen && (
          <div className="py-5">
            <ChangeEmailForm
              currentEmail={user?.email}
              onSuccess={(updatedUser) => {
                onEmailChanged?.({ email: updatedUser.email });
                setEmailOpen(false);
              }}
            />
          </div>
        )}

        <SettingsRow
          label="Password"
          value="••••••••"
          actionLabel="Change"
          actionHref="/change-password"
        />
      </div>
    </SettingsCard>
  );
}

function ChangeEmailForm({ currentEmail, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const updated = await updateEmail(email, password);
      setMessage('Email updated successfully.');
      setEmail('');
      setPassword('');
      onSuccess?.(updated);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update email.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-email" className="text-sm font-medium text-ink">
          New email
        </label>
        <input
          id="new-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={currentEmail || 'you@example.com'}
          className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email-confirm-password" className="text-sm font-medium text-ink">
          Confirm with current password
        </label>
        <div className="relative">
          <input
            id="email-confirm-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save new email'}
      </button>
    </form>
  );
}

/* ============================================================ */
/* Danger Zone                                                   */
/* ============================================================ */

function DangerSection({ onDeleted }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setError('');
    if (confirm !== 'DELETE') {
      setError('Type DELETE to confirm.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(password);
      await onDeleted?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-red-200 bg-surface shadow-sm">
      <div className="border-b border-red-200 bg-red-50/40 px-6 py-4 dark-zone-header">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="mt-0.5 text-xs text-red-700/80">
          These actions are permanent. Proceed with care.
        </p>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete my account</p>
            <p className="text-xs text-ink-muted">
              This wipes your profile, applications, and saved jobs. It cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            {open ? 'Cancel' : 'Delete account'}
          </button>
        </div>

        {open && (
          <div className="mt-5 space-y-4 rounded-xl border border-red-200 bg-red-50/30 p-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="delete-confirm"
                className="text-sm font-medium text-ink"
              >
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="delete-password"
                className="text-sm font-medium text-ink"
              >
                Enter your password
              </label>
              <div className="relative">
                <input
                  id="delete-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 pr-16 text-sm text-ink transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-red-700 transition-colors hover:text-red-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Deleting…' : 'Permanently delete my account'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Small primitives                                              */
/* ============================================================ */

function SettingsCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7">
      <header className="mb-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function SettingsRow({ label, value, actionLabel, actionHref, onAction }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="truncate text-xs text-ink-muted">{value}</p>
      </div>

      {actionHref ? (
        <Link
          to={actionHref}
          className="shrink-0 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
