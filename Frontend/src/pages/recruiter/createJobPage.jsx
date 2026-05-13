// src/pages/recruiter/CreateJobPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CategoryBadge from '../../components/CategoryBadge';
import Spinner from '../../components/Spinner';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdJob, setCreatedJob] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: [''],
        location: '',
        type: 'full-time',
        salary: '',
        totalSlots: 1
    });

    const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
    const locations = ['On-site', 'Hybrid', 'Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Dubai'];

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
        setLoading(true);
        setError(null);

        // Filter out empty requirements
        const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');

        const submitData = {
            title: formData.title,
            company: formData.company,
            description: formData.description,
            requirements: filteredRequirements,
            location: formData.location,
            type: formData.type,
            totalSlots: parseInt(formData.totalSlots)
        };

        // Add salary only if provided
        if (formData.salary && formData.salary.trim() !== '') {
            submitData.salary = formData.salary;
        }

        try {
            const response = await api.post('/api/v1/jobs', submitData);
            setCreatedJob(response.data.data);
            // Scroll to top to show success message and AI category
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job. Please try again.');
            console.error('Error creating job:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show success screen with AI-assigned category (required by spec)
    if (createdJob) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        <p className="font-medium">Job posted successfully!</p>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Job Created Successfully</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your job has been posted and AI has automatically assigned a category.
                            </p>
                        </div>

                        <div className="px-4 py-5 sm:p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{createdJob.title}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{createdJob.company}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">AI-Assigned Category</dt>
                                    <dd className="mt-1">
                                        <CategoryBadge category={createdJob.category} />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Job Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">{createdJob.type}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{createdJob.location}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Slots</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{createdJob.totalSlots}</dd>
                                </div>

                                {createdJob.salary && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Salary</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{createdJob.salary}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                onClick={() => navigate('/recruiter/dashboard')}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the details below. The category will be automatically assigned by AI.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
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
                            disabled={loading}
                            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Spinner /> : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobPage;s