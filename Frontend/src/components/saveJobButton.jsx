import { useState } from 'react';
import { toggleSaveJob } from '../services/jobService';
import { useAuth } from '../context/authContext';

export default function SaveJobButton({ job, onToggle }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(job?.saved || false);

  if (user?.role !== 'jobSeeker') return null;

  const handleClick = async () => {
    try {
      setLoading(true);
      const data = await toggleSaveJob(job._id);
      setSaved(data.saved);
      onToggle?.(data.saved);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || job?.status !== 'open';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={saved}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover'
          : 'border border-line-strong bg-surface text-ink hover:bg-surface-muted'
      }`}
    >
      {loading ? '…' : saved ? 'Saved' : 'Save'}
    </button>
  );
}
