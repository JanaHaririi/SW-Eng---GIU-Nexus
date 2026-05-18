import { useState } from "react";
import { toggleSaveJob } from "../services/jobService";

export default function SaveJobButton({ job, onToggle }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(job?.saved || false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const data = await toggleSaveJob(job._id);

      setSaved(data.saved);

      if (onToggle) {
        onToggle(data.saved);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || job?.status !== "open"}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        saved
          ? "bg-blue-600 text-white"
          : "bg-slate-200 text-slate-700"
      }`}
    >
      {loading ? "..." : saved ? "Saved" : "Save"}
    </button>
  );
}