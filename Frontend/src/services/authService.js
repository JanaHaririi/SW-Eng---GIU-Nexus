import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register({ name, email, password, role }) {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // token may already be invalid; swallow and let caller clear local state
  }
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.patch(`/auth/reset-password/${token}`, { password });
  return data;
}
export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.patch('/auth/change-password', {
    currentPassword,
    newPassword,
  });

  return data;
}