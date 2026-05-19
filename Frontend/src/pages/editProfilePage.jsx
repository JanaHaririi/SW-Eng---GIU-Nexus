import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/profileService';

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError('');
        const data = await getProfile();

        setFormData({
          name: data.name || '',
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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await updateProfile(formData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-container">Loading profile...</div>;
  }

  return (
    <div className="page-container">
      <h1>Edit Profile</h1>
      <p>Update your name, bio, and profile picture.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="filter-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="filter-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write a short bio about your skills and experience"
            rows="6"
          />
        </div>

        <div className="filter-group">
          <label>Profile Picture URL</label>
          <input
            type="text"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
            placeholder="Paste an image URL"
          />
        </div>

        <div className="action-buttons">
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
