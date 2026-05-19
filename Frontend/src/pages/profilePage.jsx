import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, extractSkills } from '../services/profileService';
import SkillChip from '../components/skillChip';

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
    return <div className="page-container">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="empty-state">No profile found.</div>
      </div>
    );
  }

  const skills = profile.extractedSkills || [];

  return (
    <div className="page-container">
      <h1>My Profile</h1>
      <p>View your profile information and extracted skills.</p>

      <div className="profile-card">
        <div className="profile-header">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              {profile.username?.charAt(0) || profile.email?.charAt(0) || 'U'}
            </div>
          )}

          <div>
            <h2>{profile.username || 'Unnamed User'}</h2>
            <p>{profile.email}</p>
            <span className="status-badge status-approved">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="profile-section">
          <h3>Bio</h3>
          <p>{profile.bio || 'No bio added yet.'}</p>
        </div>

        <Link to="/profile/edit" className="btn btn-secondary">
          Edit Profile
        </Link>

        <div className="profile-section">
          <h3>Extracted Skills</h3>

          <div className="skills-list">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillChip key={skill} skill={skill} />
              ))
            ) : (
              <p>No skills extracted yet.</p>
            )}
          </div>

          <button
            type="button"
            className="btn btn-success"
            onClick={handleExtractSkills}
            disabled={extracting}
          >
            {extracting ? 'Extracting...' : 'Extract Skills from Bio'}
          </button>

          {skillError && (
            <div className="alert alert-error profile-alert">
              {skillError}{' '}
              <Link to="/profile/edit">Update your profile first</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
