// src/pages/recruiter/RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import JobCard from '../../components/JobCard';
import Spinner from '../../components/Spinner';

const RecruiterDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/v1/jobs/my-jobs');
            setJobs(response.data.data || []);
        } catch (err) {
            setError('Failed to load your jobs. Please try again.');
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show pending approval banner (required by spec)
    if (user?.status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your account is pending admin approval. You cannot post jobs yet.
                                    Please wait for an administrator to approve your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button
                        onClick={fetchMyJobs}
                        className="ml-4 text-sm underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Jobs Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage your job postings and track applicants
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={() => navigate('/recruiter/jobs/create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Post New Job
                        </button>
                    </div>
                </div>

                {jobs.length === 0 ? (
                    <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/recruiter/jobs/create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Post New Job
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <div key={job._id} className="relative">
                                <JobCard job={job} showApplicantCount={true} />
                                <div className="mt-3 flex justify-end space-x-4">
                                    <button
                                        onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                    >
                                        Edit Job
                                    </button>
                                    <span className="text-sm text-gray-500">
                    {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? 's' : ''}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;