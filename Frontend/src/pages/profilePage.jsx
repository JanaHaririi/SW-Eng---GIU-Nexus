import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, extractSkills } from '../services/profileService';
import SkillChip from '../components/skillChip';
import Spinner from '../components/spinner';

const ROLE_LABELS = {
  jobSeeker: 'Job Seeker',
  recruiter: 'Recruiter',
  admin: 'Admin',
};

const ROLE_STYLES = {
  jobSeeker: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  recruiter: 'bg-sky-100 text-sky-800 ring-sky-200',
  admin: 'bg-violet-100 text-violet-800 ring-violet-200',
};

function getInitials(profile) {
  const source = profile?.username || profile?.email || 'U';
  return source.trim().charAt(0).toUpperCase();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [skillError, setSkillError] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleExtractSkills = async () => {
    try {
      setExtracting(true);
      setSkillError('');
      const newSkills = await extractSkills();
      setProfile((prev) => ({
        ...prev,
        extractedSkills: newSkills,
      }));
    } catch (err) {
      setSkillError(
        err.response?.data?.message || 'Could not extract skills.'
      );
    } finally {
      setExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Spinner label="Loading profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-ink-muted">
          No profile found.
        </div>
      </div>
    );
  }

  const skills = profile.extractedSkills || [];
  const roleKey = profile.role;
  const roleLabel = ROLE_LABELS[roleKey] || roleKey;
  const roleStyle = ROLE_STYLES[roleKey] || ROLE_STYLES.jobSeeker;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          View your profile information and AI-extracted skills.
        </p>
      </div>

      {/* Profile header card */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.username || 'Profile'}
              className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-primary-soft"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-fg ring-4 ring-primary-soft"
            >
              {getInitials(profile)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold tracking-tight text-ink">
              {profile.username || 'Unnamed User'}
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              {profile.email}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleStyle}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/profile/edit"
              className="rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
            >
              Edit profile
            </Link>

            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About / Bio */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">About</h3>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-muted">
          {profile.bio || 'No bio added yet. Edit your profile to add one.'}
        </p>
      </section>

      {/* Skills */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink">Skills</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              Auto-extracted from your bio with Hugging Face NER.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExtractSkills}
            disabled={extracting}
            className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {extracting ? 'Extracting…' : 'Extract Skills'}
          </button>
        </div>

        {skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillChip key={skill} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-surface-muted px-4 py-6 text-center text-sm text-ink-muted">
            No skills yet. Add a bio describing your experience, then click{' '}
            <strong>Extract Skills</strong>.
          </div>
        )}

        {skillError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {skillError}{' '}
            <Link
              to="/profile/edit"
              className="font-semibold underline underline-offset-2"
            >
              Update your profile first
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  );
}
