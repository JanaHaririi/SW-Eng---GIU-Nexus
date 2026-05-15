// Frontend/src/pages/recruiter/editJobPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/authContext';
import CategoryBadge from '../../components/categoryBadge';
import Spinner from '../../components/spinner';

const EditJobPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [job, setJob] = useState(null);
    const [showCategoryWarning, setShowCategoryWarning] = useState(false);

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

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        setLoading(true);
        try {
            // Fixed: removed duplicate /api/v1 prefix
            const response = await api.get(`/jobs/${id}`);
            const jobData = response.data.data;
            setJob(jobData);
            setFormData({
                title: jobData.title || '',
                company: jobData.company || '',
                description: jobData.description || '',
                requirements: jobData.requirements?.length ? jobData.requirements : [''],
                location: jobData.location || '',
                type: jobData.type || 'full-time',
                salary: jobData.salary || '',
                totalSlots: jobData.totalSlots || 1
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching job:', err);
            setError('Failed to load job details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Show warning if description is being edited
        if (name === 'description' && value !== job?.description) {
            setShowCategoryWarning(true);
        }
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({ ...prev, requirements: newRequirements }));

        // Reset warning is fine, description is the main trigger
    };

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, '']
        }));
    };

    const removeRequirement = (index) => {
        const newRequirements = formData.requirements.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, requirements: newRequirements }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');

        if (filteredRequirements.length === 0) {
            setError('Please add at least one requirement');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Fixed: removed duplicate /api/v1 prefix
            const response = await api.patch(`/jobs/${id}`, {
                title: formData.title,
                company: formData.company,
                description: formData.description,
                requirements: filteredRequirements,
                location: formData.location,
                type: formData.type,
                salary: formData.salary || undefined,
                totalSlots: parseInt(formData.totalSlots)
            });

            // Show success and redirect
            setTimeout(() => {
                navigate('/recruiter/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Error updating job:', err);
            setError(err.response?.data?.message || 'Failed to update job posting. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }

    if (error && !job) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button
                        onClick={fetchJob}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (user?.status === 'pending') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">Account Pending Approval</p>
                    <p>Your account is awaiting approval. You cannot edit job posts.</p>
                    <button
                        onClick={() => navigate('/recruiter/dashboard')}
                        className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Edit Job Post</h1>

            {job && (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Current AI Category: <CategoryBadge category={job.category} />
                    </p>
                </div>
            )}

            {showCategoryWarning && (
                <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
                    <p className="text-sm">
                        ⚠️ Note: Editing the job description will trigger AI re-classification.
                        The category badge may change after you save.
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Job Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Company Name *</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Job Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Editing description will trigger AI re-classification.
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Requirements *</label>
                    {formData.requirements.map((req, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={req}
                                onChange={(e) => handleRequirementChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Requirement ${index + 1}`}
                            />
                            {formData.requirements.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRequirement(index)}
                                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addRequirement}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                    >
                        + Add Requirement
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Location *</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Job Type *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {jobTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Salary (Optional)</label>
                        <input
                            type="text"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Total Slots *</label>
                        <input
                            type="number"
                            name="totalSlots"
                            value={formData.totalSlots}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/recruiter/dashboard')}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditJobPage;