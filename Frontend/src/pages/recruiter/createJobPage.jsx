import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/authContext';
import CategoryBadge from '../../components/categoryBadge';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const inputClasses =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]';

function titleCase(s) {
  return s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    totalSlots: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/jobs', {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: filteredRequirements,
        location: formData.location,
        type: formData.type,
        salary: formData.salary || undefined,
        totalSlots: parseInt(formData.totalSlots),
      });

      setCreatedJob(response.data.job);

      setTimeout(() => navigate('/recruiter'), 2000);
    } catch (err) {
      console.error('Error creating job:', err);
      setError(
        err.response?.data?.message ||
          'Failed to create job posting. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (user?.status === 'pending') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="text-base font-semibold">Account pending approval</p>
          <p className="mt-2 text-sm">
            Your recruiter account is awaiting admin approval. You can't post
            jobs until your account is approved.
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

  if (createdJob) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-base font-semibold">✓ Job posted successfully</p>
          <p className="mt-1 text-sm">
            Your job has been created and the AI has assigned a category.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {createdJob.title}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{createdJob.company}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium text-ink">
              AI-assigned category:
            </span>
            <CategoryBadge category={createdJob.category} />
          </div>

          <button
            onClick={() => navigate('/recruiter')}
            className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
          >
            Go to dashboard
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
          Post a new job
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          The AI auto-classifies your job into a category based on the description.
        </p>
      </div>

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
            placeholder="e.g. Senior Frontend Developer"
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
            placeholder="Your company name"
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
            placeholder="Responsibilities, what a typical day looks like, what success looks like…"
            className={inputClasses}
          />
          <p className="text-xs text-ink-subtle">
            The AI uses this text to auto-assign a category.
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
              placeholder="e.g. Berlin, Germany or Remote"
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
              placeholder="e.g. €60,000 – €80,000"
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
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
