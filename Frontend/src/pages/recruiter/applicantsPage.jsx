// Frontend/src/pages/recruiter/applicantsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/spinner';
import ApplicationStatusBadge from '../../components/applicationStatusBadge';

const ApplicantsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJobAndApplicants();
    }, [jobId]);

    const fetchJobAndApplicants = async () => {
        setLoading(true);
        try {
            // Fetch job details
            const jobResponse = await api.get(`/jobs/${jobId}`);
            setJob(jobResponse.data.data);

            // Fetch applicants for this job
            const applicantsResponse = await api.get(`/jobs/${jobId}/applicants`);
            setApplicants(applicantsResponse.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching applicants:', err);
            setError('Failed to load applicants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId, newStatus) => {
        setUpdatingStatus(applicationId);
        try {
            await api.patch(`/applications/${applicationId}/status`, { status: newStatus });

            // Update local state
            setApplicants(prev => prev.map(app =>
                app._id === applicationId
                    ? { ...app, status: newStatus }
                    : app
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update application status. Please try again.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button
                        onClick={fetchJobAndApplicants}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/recruiter/dashboard')}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
                ← Back to Dashboard
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">{job?.title}</h1>
                <p className="text-gray-600">{job?.company} • {job?.location}</p>
                <p className="text-sm text-gray-500 mt-1">
                    Total Applicants: {applicants.length}
                </p>
            </div>

            {applicants.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No applicants have applied for this position yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applicant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skills
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied On
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cover Letter
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {applicants.map((application) => (
                            <tr key={application._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {application.applicant?.name || 'Unknown'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {application.applicant?.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {application.applicant?.skills?.slice(0, 3).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                            >
                          {skill}
                        </span>
                                        ))}
                                        {application.applicant?.skills?.length > 3 && (
                                            <span className="text-xs text-gray-500">
                          +{application.applicant.skills.length - 3} more
                        </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={application.status}
                                        onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                                        disabled={updatingStatus === application._id}
                                        className={`px-2 py-1 text-sm rounded border ${
                                            application.status === 'pending' ? 'border-yellow-400 bg-yellow-50' :
                                                application.status === 'shortlisted' ? 'border-green-400 bg-green-50' :
                                                    'border-red-400 bg-red-50'
                                        }`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    {updatingStatus === application._id && (
                                        <span className="ml-2 text-xs text-gray-400">Updating...</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {application.coverLetter ? (
                                        <button
                                            onClick={() => {
                                                const modal = document.createElement('div');
                                                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                                                modal.innerHTML = `
                            <div class="bg-white rounded-lg p-6 max-w-lg max-h-96 overflow-auto">
                              <h3 class="font-bold mb-2">Cover Letter</h3>
                              <p class="text-gray-700 whitespace-pre-wrap">${application.coverLetter}</p>
                              <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button>
                            </div>
                          `;
                                                document.body.appendChild(modal);
                                                modal.querySelector('button').onclick = () => modal.remove();
                                            }}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            View Letter
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-sm">No cover letter</span>
                                    )}
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

export default ApplicantsPage;