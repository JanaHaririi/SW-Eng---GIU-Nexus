import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import CategoryBadge from '../../components/categoryBadge';
import Spinner from '../../components/spinner';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const inputClasses =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]';

function titleCase(s) {
  return s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    totalSlots: 1,
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs/${id}`);
      const jobData = response.data.job;
      setJob(jobData);
      setFormData({
        title: jobData.title || '',
        company: jobData.company || '',
        description: jobData.description || '',
        requirements: jobData.requirements?.length ? jobData.requirements : [''],
        location: jobData.location || '',
        type: jobData.type || 'full-time',
        salary: jobData.salary || '',
        totalSlots: jobData.totalSlots || 1,
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'description' && value !== job?.description) {
      setShowCategoryWarning(true);
    }
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData((prev) => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const removeRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, requirements: newRequirements }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredRequirements = formData.requirements.filter(
      (req) => req.trim() !== ''
    );

    if (filteredRequirements.length === 0) {
      setError('Please add at least one requirement.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.patch(`/jobs/${id}`, {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: filteredRequirements,
        location: formData.location,
        type: formData.type,
        salary: formData.salary || undefined,
        totalSlots: parseInt(formData.totalSlots),
      });

      setTimeout(() => navigate('/recruiter'), 1200);
    } catch (err) {
      console.error('Error updating job:', err);
      setError(
        err.response?.data?.message ||
          'Failed to update job posting. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={fetchJob}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (user?.status === 'pending') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="text-base font-semibold">Account pending approval</p>
          <p className="mt-2 text-sm">
            Your account is awaiting approval. You can't edit job posts yet.
          </p>
          <button
            onClick={() => navigate('/recruiter')}
            className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Recruiter
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Edit job post
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Update the details of your posting.
        </p>
      </div>

      {job && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink-muted">
          <span>Current AI category:</span>
          <CategoryBadge category={job.category} />
        </div>
      )}

      {showCategoryWarning && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Editing the description will trigger AI re-classification — the
          category badge may change after you save.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-ink">
            Job title *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="company" className="text-sm font-medium text-ink">
            Company name *
          </label>
          <input
            id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-ink"
          >
            Job description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className={inputClasses}
          />
          <p className="text-xs text-ink-subtle">
            Editing this triggers AI re-classification.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Requirements *</label>
          <div className="space-y-2">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) =>
                    handleRequirementChange(index, e.target.value)
                  }
                  placeholder={`Requirement ${index + 1}`}
                  className={inputClasses}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    aria-label="Remove requirement"
                    className="shrink-0 rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRequirement}
            className="mt-1 self-start text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            + Add requirement
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className="text-sm font-medium text-ink">
              Location *
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-medium text-ink">
              Job type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={inputClasses}
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {titleCase(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="salary" className="text-sm font-medium text-ink">
              Salary (optional)
            </label>
            <input
              id="salary"
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="totalSlots"
              className="text-sm font-medium text-ink"
            >
              Total slots *
            </label>
            <input
              id="totalSlots"
              type="number"
              name="totalSlots"
              value={formData.totalSlots}
              onChange={handleChange}
              min="1"
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/recruiter')}
            className="rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;
