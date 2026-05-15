import React, { useEffect, useState } from "react";
import {
  getPendingRecruiters,
  updateUserStatus,
} from "../../services/userService";

const PendingRecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPendingRecruiters = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingRecruiters();

      setRecruiters(data.data || data.users || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load pending recruiters. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRecruiters();
  }, []);

  const handleStatusUpdate = async (userId, status) => {
    try {
      setActionLoadingId(userId);
      setError("");
      setSuccessMessage("");

      await updateUserStatus(userId, status);

      setRecruiters((prevRecruiters) =>
        prevRecruiters.filter((recruiter) => recruiter._id !== userId)
      );

      setSuccessMessage(
        status === "approved"
          ? "Recruiter approved successfully."
          : "Recruiter rejected successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${status} recruiter. Please try again.`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Pending Recruiters</h1>
        <p>Loading pending recruiters...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Pending Recruiters</h1>
      <p>Review recruiter accounts waiting for admin approval.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {recruiters.length === 0 ? (
        <div className="empty-state">
          <p>No pending recruiters found.</p>
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {recruiters.map((recruiter) => (
                <tr key={recruiter._id}>
                  <td>{recruiter.name}</td>
                  <td>{recruiter.email}</td>
                  <td>{recruiter.role}</td>
                  <td>
                    <span className="status-badge status-pending">
                      {recruiter.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleStatusUpdate(recruiter._id, "approved")
                        }
                        disabled={actionLoadingId === recruiter._id}
                      >
                        {actionLoadingId === recruiter._id
                          ? "Saving..."
                          : "Approve"}
                      </button>

                      <button
                        className="btn btn-warning"
                        onClick={() =>
                          handleStatusUpdate(recruiter._id, "rejected")
                        }
                        disabled={actionLoadingId === recruiter._id}
                      >
                        {actionLoadingId === recruiter._id
                          ? "Saving..."
                          : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingRecruitersPage;