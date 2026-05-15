import api from "./api";

export const getPendingRecruiters = async () => {
  const response = await api.get("/users", {
    params: {
      role: "recruiter",
      status: "pending",
    },
  });

  return response.data;
};

export const getUsers = async (filters = {}) => {
  const params = {};

  if (filters.role) params.role = filters.role;
  if (filters.status) params.status = filters.status;

  const response = await api.get("/users", { params });

  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/users/${userId}/status`, {
    status,
  });

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);

  return response.data;
};