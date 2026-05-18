// Frontend/src/pages/recruiter/createJobPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AuthContext from '../../context/authContext';
import CategoryBadge from '../../components/categoryBadge';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdJob, setCreatedJob] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        company: user?.company || '',
        description: '',
        requirements: [''],
        location: '',
        type: 'full-time',
        salary: '',
        totalSlots: 1
    });

    const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({ ...prev, requirements: newRequirements }));
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

        // Filter out empty requirements
        const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');

        if (filteredRequirements.length === 0) {
            setError('Please add at least one requirement');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fixed: removed duplicate /api/v1 prefix
            const response = await api.post('/jobs', {
                title: formData.title,
                company: formData.company,
                description: formData.description,
                requirements: filteredRequirements,
                location: formData.location,
                type: formData.type,
                salary: formData.salary || undefined,
                totalSlots: parseInt(formData.totalSlots)
            });

            setCreatedJob(response.data.job);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/recruiter');
            }, 2000);
        } catch (err) {
            console.error('Error creating job:', err);
            setError(err.response?.data?.message || 'Failed to create job posting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show pending approval banner
    if (user?.status === 'pending') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">Account Pending Approval</p>
                    <p>
                        Your recruiter account is awaiting admin approval.
                        You cannot post jobs until your account is approved.
                    </p>
                    <button
                        onClick={() => navigate('/recruiter')}
                        className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (createdJob) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <p className="font-bold">✓ Job Posted Successfully!</p>
                    <p>Your job has been created and AI has assigned a category.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">{createdJob.title}</h2>
                    <p className="text-gray-600 mb-2">{createdJob.company}</p>
                    <div className="mb-4">
                        <span className="font-medium">AI-Assigned Category: </span>
                        <CategoryBadge category={createdJob.category} />
                    </div>
                    <button
                        onClick={() => navigate('/recruiter')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

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
                        placeholder="e.g., Senior Frontend Developer"
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
                        placeholder="Your company name"
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
                        placeholder="Detailed job description, responsibilities, etc."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Note: The AI will automatically assign a category based on this description.
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
                            placeholder="e.g., Berlin, Germany or Remote"
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
                            placeholder="e.g., €60,000 - €80,000"
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
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                    >
                        {loading ? 'Creating...' : 'Post Job'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/recruiter')}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJobPage;