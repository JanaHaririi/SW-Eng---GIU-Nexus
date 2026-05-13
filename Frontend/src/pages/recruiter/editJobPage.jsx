// src/pages/recruiter/EditJobPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CategoryBadge from '../../components/CategoryBadge';
import Spinner from '../../components/Spinner';

const EditJobPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [job, setJob] = useState(null);
    const [originalDescription, setOriginalDescription] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: [],
        location: '',
        type: 'full-time',
        salary: '',
        totalSlots: 1,
        status: 'open'
    });

    const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
    const locations = ['On-site', 'Hybrid', 'Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Dubai'];
    const jobStatuses = ['open', 'closed', 'on-hold'];

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/v1/jobs/${id}`);
            const jobData = response.data.data;
            setJob(jobData);
            setOriginalDescription(jobData.description);
            setFormData({
                title: jobData.title || '',
                company: jobData.company || '',
                description: jobData.description || '',
                requirements: jobData.requirements || [],
                location: jobData.location || '',
                type: jobData.type || 'full-time',
                salary: jobData.salary || '',
                totalSlots: jobData.totalSlots || 1,
                status: jobData.status || 'open'
            });
        } catch (err) {
            setError('Failed to load job details. Please try again.');
            console.error('Error fetching job:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({
            ...prev,
            requirements: newRequirements
        }));
    };

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, '']
        }));
    };

    const removeRequirement = (index) => {
        if (formData.requirements.length > 1) {
            const newRequirements = formData.requirements.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                requirements: newRequirements
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Filter out empty requirements
        const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');

        const submitData = {
            title: formData.title,
            company: formData.company,
            description: formData.description,
            requirements: filteredRequirements,
            location: formData.location,
            type: formData.type,
            totalSlots: parseInt(formData.totalSlots),
            status: formData.status
        };

        if (formData.salary && formData.salary.trim() !== '') {
            submitData.salary = formData.salary;
        }

        try {
            await api.patch(`/api/v1/jobs/${id}`, submitData);
            setSuccess('Job updated successfully!');

            setTimeout(() => {
                navigate('/recruiter/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update job. Please try again.');
            console.error('Error updating job:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const hasDescriptionChanged = formData.description !== originalDescription;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error && !job) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button onClick={() => navigate('/recruiter/dashboard')} className="ml-4 underline">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update your job posting details.
                    </p>
                </div>

                {/* Warning about AI reclassification (required by spec) */}
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> Editing the description will re-trigger AI classification
                                and may change the job category badge.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current category display */}
                {job && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600 mb-2">Current AI-assigned category:</p>
                        <CategoryBadge category={job.category} />
                        {hasDescriptionChanged && (
                            <p className="mt-2 text-xs text-yellow-600">
                                ⚠️ Description changed - category will be reclassified on save
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success} Redirecting to dashboard...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            name="company"
                            id="company"
                            required
                            value={formData.company}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Job Description *
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows="6"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Describe the role, responsibilities, and qualifications..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Requirements *
                        </label>
                        {formData.requirements.map((req, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                                    placeholder={`Requirement ${index + 1}`}
                                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {formData.requirements.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRequirement(index)}
                                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRequirement}
                            className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            + Add Requirement
                        </button>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location *
                        </label>
                        <select
                            name="location"
                            id="location"
                            required
                            value={formData.location}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a location</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Job Type *
                        </label>
                        <select
                            name="type"
                            id="type"
                            required
                            value={formData.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {jobTypes.map(type => (
                                <option key={type} value={type}>{type.replace('-', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                            Salary (optional)
                        </label>
                        <input
                            type="text"
                            name="salary"
                            id="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            placeholder="e.g., $80,000 - $100,000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="totalSlots" className="block text-sm font-medium text-gray-700">
                            Total Slots *
                        </label>
                        <input
                            type="number"
                            name="totalSlots"
                            id="totalSlots"
                            required
                            min="1"
                            value={formData.totalSlots}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Job Status
                        </label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {jobStatuses.map(status => (
                                <option key={status} value={status}>{status.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/recruiter/dashboard')}
                            className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Spinner /> : 'Update Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobPage;