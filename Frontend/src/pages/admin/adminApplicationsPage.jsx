import { useEffect, useMemo, useState } from 'react';
import Spinner from '../../components/spinner';
import ApplicationStatusBadge from '../../components/applicationStatusBadge';
import Skeleton from '../../components/skeleton';
import {
    getApplications,
    updateApplicationStatus,
} from '../../services/applicationService';
import { formatDate, pluralize } from '../../utils/formatters';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
];

const AdminApplicationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

    const limit = 10;
    const totalPages = useMemo(
        () => Math.max(Math.ceil(total / limit), 1),
        [total]
    );

    useEffect(() => {
        fetchApplications();
    }, [status, page]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getApplications({ status, page, limit });

            setApplications(data.applications || data.data || []);
            setTotal(data.total || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(
                err.response?.data?.message ||
                'Failed to load applications. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        setUpdatingStatus(applicationId);
        try {
            const data = await updateApplicationStatus(applicationId, newStatus);
            const updatedApplication = data.application;

            setApplications((prev) =>
                prev.map((app) =>
                    app._id === applicationId
                        ? { ...app, ...(updatedApplication || {}), status: newStatus }
                        : app
                )
            );
        } catch (err) {
            console.error('Error updating status:', err);
            setError(
                err.response?.data?.message ||
                'Failed to update application status. Please try again.'
            );
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleFilterChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex items-center gap-3">
                    <Spinner />
                    <span className="text-sm text-slate-600">Loading applications...</span>
                </div>
                <Skeleton className="h-24 w-full" rows={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button
                        onClick={fetchApplications}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        All Applications
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Every application submitted across the platform.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {pluralize(total || applications.length, 'application')}
                    </p>
                </div>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Filter by status
                    <select
                        value={status}
                        onChange={handleFilterChange}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {applications.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">
                        {status
                            ? 'No applications match the selected status.'
                            : 'No applications have been submitted yet.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Job
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Skills
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Applied On
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Cover Letter
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {applications.map((application) => {
                                const applicant = application.user || application.applicant || {};
                                const skills = applicant.extractedSkills || applicant.skills || [];
                                const job = application.job || {};

                                return (
                                    <tr key={application._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {applicant.username || applicant.name || 'Unknown applicant'}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {applicant.email || 'No email provided'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {job.title || 'Unknown job'}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {job.company || 'Company not listed'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {skills.slice(0, 3).map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {skills.length > 3 && (
                                                        <span className="text-xs text-slate-500">
                                                            +{skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">No skills listed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(application.appliedAt || application.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <ApplicationStatusBadge status={application.status} />
                                                <select
                                                    value={application.status}
                                                    onChange={(e) =>
                                                        handleStatusUpdate(application._id, e.target.value)
                                                    }
                                                    disabled={updatingStatus === application._id}
                                                    className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                {updatingStatus === application._id && (
                                                    <span className="text-xs text-slate-400">Updating...</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {application.coverLetter ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedCoverLetter({
                                                            applicantName:
                                                                applicant.username || applicant.name || 'Applicant',
                                                            text: application.coverLetter,
                                                        })
                                                    }
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    View Letter
                                                </button>
                                            ) : (
                                                <span className="text-sm text-slate-400">No cover letter</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {applications.length > 0 && (
                <div className="mt-5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                        disabled={page === 1}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-slate-600">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setPage((currentPage) => Math.min(currentPage + 1, totalPages))
                        }
                        disabled={page >= totalPages}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {selectedCoverLetter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                    <div className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-md bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Cover Letter
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {selectedCoverLetter.applicantName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCoverLetter(null)}
                                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {selectedCoverLetter.text}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationsPage;
