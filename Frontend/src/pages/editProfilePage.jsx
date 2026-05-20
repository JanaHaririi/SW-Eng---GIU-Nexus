import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/profileService';
import { useAuth } from '../context/authContext';
import Spinner from '../components/spinner';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getInitials(source) {
  return (source || 'U').trim().charAt(0).toUpperCase();
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [markedForRemoval, setMarkedForRemoval] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError('');
        const data = await getProfile();
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setMarkedForRemoval(false);
    setSelectedFile(file);
  };

  const handleRemovePicture = () => {
    setSelectedFile(null);
    setMarkedForRemoval(true);
  };

  const handleUndoRemove = () => {
    setMarkedForRemoval(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('username', formData.username);
        payload.append('bio', formData.bio);
        payload.append('profilePicture', selectedFile);
      } else {
        payload = {
          username: formData.username,
          bio: formData.bio,
          profilePicture: markedForRemoval ? '' : formData.profilePicture,
        };
      }

      const updated = await updateProfile(payload);

      updateUser({
        name: updated?.username ?? formData.username,
        profilePicture: updated?.profilePicture ?? '',
      });

      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Spinner label="Loading profile" />
      </div>
    );
  }

  const displayedPicture = markedForRemoval
    ? ''
    : previewUrl || formData.profilePicture;
  const hasExistingPicture = Boolean(formData.profilePicture);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Update your name, bio, and profile picture.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Profile picture card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7">
          <h2 className="text-base font-semibold text-ink">Profile picture</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            JPEG, PNG, or WebP. Max 5MB.
          </p>

          <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {displayedPicture ? (
              <img
                src={displayedPicture}
                alt="Profile preview"
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-primary-soft"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-fg ring-4 ring-primary-soft"
              >
                {getInitials(formData.username)}
              </div>
            )}

            <div className="flex-1 space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? 'Change file' : 'Choose file'}
              </label>

              {selectedFile && (
                <p className="text-xs text-ink-muted">
                  Selected: <span className="font-medium text-ink">{selectedFile.name}</span>
                </p>
              )}

              {hasExistingPicture && !selectedFile && !markedForRemoval && (
                <button
                  type="button"
                  onClick={handleRemovePicture}
                  className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                >
                  Remove picture
                </button>
              )}

              {markedForRemoval && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Picture will be removed when you save.{' '}
                  <button
                    type="button"
                    onClick={handleUndoRemove}
                    className="font-semibold underline underline-offset-2"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details card */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7">
          <h2 className="text-base font-semibold text-ink">Account details</h2>

          <div className="mt-5 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-ink">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="How you'll appear on the platform"
                className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-ink">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a short bio about your skills and experience. The AI will use this to extract your skills."
                rows={6}
                className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              />
              <p className="text-xs text-ink-subtle">
                Tip: name specific tools you've used (e.g. <em>React, Node.js, MongoDB</em>) — the AI picks up technologies by name.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
