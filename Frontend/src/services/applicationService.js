import api from './api';

const buildParams = (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  return params;
};

export const getApplications = async (filters = {}) => {
  const response = await api.get('/applications', {
    params: buildParams(filters),
  });

  return response.data;
};

export const getMyApplications = async (filters = {}) => {
  const response = await api.get('/applications/my', {
    params: buildParams(filters),
  });

  return response.data;
};

export const createApplication = async ({ jobId, coverLetter = '' }) => {
  const response = await api.post('/applications', {
    jobId,
    coverLetter,
  });

  return response.data;
};

export const getJobApplicants = async (jobId, filters = {}) => {
  const response = await api.get(`/jobs/${jobId}/applicants`, {
    params: buildParams(filters),
  });

  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, {
    status,
  });

  return response.data;
};
