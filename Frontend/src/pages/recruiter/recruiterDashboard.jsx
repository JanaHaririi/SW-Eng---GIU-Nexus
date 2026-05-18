// Frontend/src/pages/recruiter/recruiterDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/authContext';
import Spinner from '../../components/spinner';
import JobCard from '../../components/jobCard';

const RecruiterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            // Fixed: removed duplicate /api/v1 prefix
            const response = await api.get('/jobs/my-jobs');
            setJobs(response.data.jobs || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load your job posts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show pending approval banner
    if (user?.status === 'pending') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
                    <p className="font-bold">Pending Admin Approval</p>
                    <p>
                        Your account is awaiting approval from an administrator.
                        You cannot create or manage job posts until your account is approved.
                    </p>
                    <p className="text-sm mt-2">
                        Please check back later or contact support if you have questions.
                    </p>
                </div>
            </div>
        );
    }

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
                        onClick={fetchMyJobs}
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
                <Link
                    to="/recruiter/jobs/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Post New Job
                </Link>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Your Job Posts</h2>
                {jobs.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
                        <Link
                            to="/recruiter/jobs/new"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Create your first job posting →
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <div key={job._id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <JobCard job={job} showSaveButton={false} />
                                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Applicants: <span className="font-semibold">{job.applicantCount || 0}</span>
                  </span>
                                    <Link
                                        to={`/recruiter/jobs/${job._id}/applicants`}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        View Applicants →
                                    </Link>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Link
                                        to={`/recruiter/jobs/${job._id}/edit`}
                                        className="text-gray-600 hover:text-gray-700 text-sm"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium mb-2">📊 Quick Stats</p>
                <p>Total job posts: {jobs.length}</p>
                <p>
                    Total applicants:{' '}
                    {jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0)}
                </p>
            </div>
        </div>
    );
};

export default RecruiterDashboard;