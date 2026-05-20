import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Spinner from '../components/spinner';
import CategoryBadge from '../components/categoryBadge';
import ApplicationStatusBadge from '../components/applicationStatusBadge';
import SaveJobButton from '../components/saveJobButton';

import {
  getJobById,
  applyToJob,
  generateCoverLetter,
} from '../services/jobService';

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await getJobById(id);
      setJob(data.job || data);
      if (data.applicationStatus) {
        setApplicationStatus(data.applicationStatus);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load job.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await applyToJob(id, { coverLetter });
      setApplicationStatus('pending');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      setGenerating(true);
      setGenerateError('');
      const data = await generateCoverLetter(id);
      setCoverLetter(data.coverLetter || '');
    } catch (err) {
      console.error(err);
      setGenerateError(
        err?.response?.data?.message ||
          "Couldn't generate a draft right now. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <article className="rounded-2xl border border-line bg-surface p-8 shadow-sm sm:p-10">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-ink-subtle">
              Posted by{' '}
              <span className="font-medium text-ink-muted">
                {job.createdBy?.username || 'Unknown recruiter'}
              </span>
            </p>
            <p className="mt-2 text-lg text-ink-muted">{job.company}</p>
          </div>

          <SaveJobButton job={job} />
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {job.type && (
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
              {job.type}
            </span>
          )}
          {job.location && (
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
              {job.location}
            </span>
          )}
          {job.category && <CategoryBadge category={job.category} />}
        </div>

        {job.salary && (
          <p className="mt-6 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
            Salary: {job.salary}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-base font-semibold text-ink">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">
            {job.description}
          </p>
        </section>

        {job.requirements?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-ink">Requirements</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-muted">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 border-t border-line pt-8">
          {applicationStatus ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-muted">
                You've applied to this job. Current status:
              </p>
              <ApplicationStatusBadge status={applicationStatus} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-ink">
                  Cover letter (optional)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={generating}
                  className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating
                    ? 'Generating…'
                    : '✨ Generate Cover Letter Suggestion'}
                </button>
              </div>

              {generateError && (
                <p className="text-sm text-red-600">{generateError}</p>
              )}

              <textarea
                placeholder="Write your cover letter, or click Generate above to get an AI draft you can edit."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-line-strong bg-surface p-4 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-[color:var(--color-focus-ring)]"
              />

              <button
                onClick={handleApply}
                disabled={applying}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying ? 'Applying…' : 'Apply'}
              </button>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
