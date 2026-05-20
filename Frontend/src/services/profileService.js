import api from './api';

export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data.user;
};

export const updateProfile = async (profileData) => {
  const isFormData =
    typeof FormData !== 'undefined' && profileData instanceof FormData;

  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;

  const res = await api.patch('/profile', profileData, config);
  return res.data.user;
};

export const extractSkills = async () => {
  const res = await api.post('/profile/extract-skills');
  return res.data.extractedSkills || [];
};

export const updateEmail = async (email, password) => {
  const res = await api.patch('/profile/email', { email, password });
  return res.data.user;
};

export const deleteAccount = async (password) => {
  const res = await api.delete('/profile', { data: { password } });
  return res.data;
};