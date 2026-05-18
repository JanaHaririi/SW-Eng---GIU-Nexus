import api from "./api";

export const getJobs = async (params = {}) => {
  const response = await api.get("/jobs", { params });
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const getSavedJobs = async () => {
  const response = await api.get("/jobs/saved");
  return response.data;
};

export const toggleSaveJob = async (id) => {
  const response = await api.post(`/jobs/${id}/save`);
  return response.data;
};

export const applyToJob = async (id, data) => {
  const response = await api.post(`/jobs/${id}/apply`, data);
  return response.data;
};