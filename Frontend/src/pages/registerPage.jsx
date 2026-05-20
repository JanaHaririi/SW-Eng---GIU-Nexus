import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const ROLE_OPTIONS = [
  {
    value: 'jobSeeker',
    title: 'Job Seeker',
    description: 'I want to find internships and jobs.',
  },
  {
    value: 'recruiter',
    title: 'Recruiter',
    description: 'I want to post jobs and review applicants.',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'jobSeeker',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleRoleChange(role) {
    setFormData((prev) => ({ ...prev, role }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await register(formData);

      if (data?.user?.status === 'pending' || formData.role === 'recruiter') {
        setMessage(
          'Your recruiter account has been created and is pending admin approval. You will be able to log in once an admin approves your account.'
        );
      } else {
        navigate('/login', {
          replace: true,
          state: { justRegistered: true },
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Join GIU Nexus to find your next opportunity — or your next hire.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-md"
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-ink">
            I'm signing up as a…
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROLE_OPTIONS.map((option) => {
              const isSelected = formData.role === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRoleChange(option.value)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-primary bg-primary-soft shadow-md ring-2 ring-[color:var(--color-focus-ring)]'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted'
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-fg'
                        : 'border-line-strong bg-surface'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.296a1 1 0 010 1.408l-7.997 8a1 1 0 01-1.42 0L3.296 10.71a1 1 0 011.408-1.42l3.293 3.293 7.296-7.287a1 1 0 011.411 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>

                  <span
                    className={`pr-7 text-sm font-semibold ${
                      isSelected ? 'text-primary-soft-fg' : 'text-ink'
                    }`}
                  >
                    {option.title}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          {formData.role === 'recruiter' && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Recruiter accounts require admin approval before posting jobs.
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
            placeholder="Sara Ahmed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
            placeholder="you@student.giu-uni.de"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
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

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
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
