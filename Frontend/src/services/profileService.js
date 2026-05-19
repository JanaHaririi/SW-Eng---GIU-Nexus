import api from './api';

export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data.user;
};

export const updateProfile = async (profileData) => {
  const res = await api.patch('/profile', profileData);
  return res.data.user;
};

export const extractSkills = async () => {
  const res = await api.post('/profile/extract-skills');
  return res.data.extractedSkills || [];
};