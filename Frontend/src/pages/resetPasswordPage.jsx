import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useAuth } from '../context/authContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await resetPassword(token, password);

      if (data?.token && data?.user) {
        login(data.token, data.user);
      }

      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset password failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Reset Password</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}