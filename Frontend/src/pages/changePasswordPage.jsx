import { useState } from 'react';
import { changePassword } from '../services/authService';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      setMessage('Password changed successfully.');
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Current password is incorrect.');
      } else {
        setError(
          err?.response?.data?.message || 'Failed to change password'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Change Password</h2>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}