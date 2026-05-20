import React, { useEffect, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  deleteUser,
} from "../../services/userService";
import Modal from "../../components/modal";
import Spinner from "../../components/spinner";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers(filters);

      setUsers(data.data || data.users || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.role, filters.status]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleStatusChange = async (userId, status) => {
    try {
      setActionLoadingId(userId);
      setError("");
      setSuccessMessage("");

      await updateUserStatus(userId, status);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status } : user
        )
      );

      setSuccessMessage("User status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update user status. Please try again."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoadingId(selectedUser._id);
      setError("");
      setSuccessMessage("");

      await deleteUser(selectedUser._id);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== selectedUser._id)
      );

      setSuccessMessage("User deleted successfully.");
      closeDeleteModal();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          All users
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          View, filter, update, and delete platform users.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="filters-card">
        <div className="filter-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All roles</option>
            <option value="jobSeeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading users" />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found for the selected filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.role === "recruiter" ? (
                      <select
                        value={user.status || ""}
                        onChange={(event) =>
                          handleStatusChange(user._id, event.target.value)
                        }
                        disabled={actionLoadingId === user._id}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => openDeleteModal(user)}
                      disabled={actionLoadingId === user._id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete User"
        message={
          selectedUser
            ? `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={closeDeleteModal}
        loading={actionLoadingId === selectedUser?._id}
      />
    </div>
  );
};

export default AdminUsersPage;