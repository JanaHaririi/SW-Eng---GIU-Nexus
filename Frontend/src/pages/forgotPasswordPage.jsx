import { useState } from 'react';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      await forgotPassword(email);

      setMessage(
        'If an account with that email exists, a reset link has been sent.'
      );
    } catch {
      setMessage(
        'If an account with that email exists, a reset link has been sent.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Forgot Password</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}