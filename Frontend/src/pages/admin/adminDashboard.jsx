import { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/adminService';
import Spinner from '../../components/spinner';

/* -------------------- color palettes -------------------- */

const ROLE_COLORS = {
  jobSeeker: { fill: '#10b981', label: 'Job Seekers' },
  recruiter: { fill: '#0ea5e9', label: 'Recruiters' },
  admin: { fill: '#8b5cf6', label: 'Admins' },
};

const JOB_STATUS_COLORS = {
  open: { fill: '#10b981', label: 'Open' },
  closed: { fill: '#64748b', label: 'Closed' },
};

const APP_STATUS_COLORS = {
  pending: { fill: '#f59e0b', label: 'Pending' },
  shortlisted: { fill: '#0ea5e9', label: 'Shortlisted' },
  accepted: { fill: '#10b981', label: 'Accepted' },
  rejected: { fill: '#ef4444', label: 'Rejected' },
};

/* -------------------- chart primitives -------------------- */

function DonutChart({ data, total, centerLabel }) {
  const size = 180;
  const stroke = 22;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  if (!total) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-ink-subtle">
        No data yet
      </div>
    );
  }

  let cumulative = 0;
  const segments = data.map((d) => {
    const fraction = d.value / total;
    const length = fraction * C;
    const offset = -cumulative * C;
    cumulative += fraction;
    return { ...d, length, offset };
  });

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-44 w-44"
        role="img"
        aria-label={centerLabel ? `Donut chart, total ${centerLabel}` : 'Donut chart'}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${seg.length} ${C - seg.length}`}
            strokeDashoffset={seg.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 28, fontWeight: 700 }}
        >
          {total}
        </text>
        {centerLabel && (
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="fill-ink-subtle"
            style={{ fontSize: 11, letterSpacing: '0.05em' }}
          >
            {centerLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

function Legend({ items }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2 text-ink-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          <span className="font-semibold text-ink">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function BarRow({ label, value, max, color, rank }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 4) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      {typeof rank === 'number' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-soft-fg">
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-ink">{label}</span>
          <span className="shrink-0 text-xs font-semibold text-ink-muted">
            {value}
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- card primitives -------------------- */

function StatCard({ label, value, accentColor }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
        {label}
      </p>
      <p
        className="mt-2 text-3xl font-bold tracking-tight"
        style={{ color: accentColor }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}
      <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/* -------------------- page -------------------- */

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load admin stats.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Spinner label="Loading dashboard" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const usersByRole = stats?.usersByRole || [];
  const jobsByStatus = stats?.jobsByStatus || [];
  const appsByStatus = stats?.appsByStatus || [];
  const topJobs = stats?.topJobs || [];

  const totalUsers = usersByRole.reduce((s, x) => s + (x.count || 0), 0);
  const totalJobs = jobsByStatus.reduce((s, x) => s + (x.count || 0), 0);
  const totalApps = appsByStatus.reduce((s, x) => s + (x.count || 0), 0);

  const usersData = usersByRole.map((u) => ({
    label: ROLE_COLORS[u._id]?.label || u._id,
    value: u.count,
    color: ROLE_COLORS[u._id]?.fill || '#94a3b8',
  }));

  const appsData = appsByStatus.map((a) => ({
    label: APP_STATUS_COLORS[a._id]?.label || a._id,
    value: a.count,
    color: APP_STATUS_COLORS[a._id]?.fill || '#94a3b8',
  }));

  const jobsData = jobsByStatus.map((j) => ({
    label: JOB_STATUS_COLORS[j._id]?.label || j._id,
    value: j.count,
    color: JOB_STATUS_COLORS[j._id]?.fill || '#94a3b8',
  }));

  const jobsMax = Math.max(1, ...jobsData.map((j) => j.value));
  const topJobsMax = Math.max(1, ...topJobs.map((j) => j.applicationCount || 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Platform overview
        </h1>
        <p className="text-sm text-ink-muted">
          Live counts and breakdowns across every account, job, and application.
        </p>
      </div>

      {/* Stat strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={totalUsers} accentColor="#0ea5e9" />
        <StatCard label="Total jobs" value={totalJobs} accentColor="#10b981" />
        <StatCard
          label="Applications"
          value={totalApps}
          accentColor="#f59e0b"
        />
      </section>

      {/* Charts row 1 */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard eyebrow="Users" title="Users by role">
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
            <DonutChart
              data={usersData}
              total={totalUsers}
              centerLabel="USERS"
            />
            <Legend items={usersData} />
          </div>
        </ChartCard>

        <ChartCard eyebrow="Jobs" title="Jobs by status">
          {jobsData.length === 0 ? (
            <p className="text-sm text-ink-subtle">No jobs yet.</p>
          ) : (
            <div className="space-y-4">
              {jobsData.map((j) => (
                <BarRow
                  key={j.label}
                  label={j.label}
                  value={j.value}
                  max={jobsMax}
                  color={j.color}
                />
              ))}
            </div>
          )}
        </ChartCard>
      </section>

      {/* Charts row 2 */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard eyebrow="Pipeline" title="Applications by status">
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
            <DonutChart
              data={appsData}
              total={totalApps}
              centerLabel="APPS"
            />
            <Legend items={appsData} />
          </div>
        </ChartCard>

        <ChartCard eyebrow="Leaderboard" title="Top jobs by applicants">
          {topJobs.length === 0 ? (
            <p className="text-sm text-ink-subtle">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {topJobs.map((job, idx) => (
                <BarRow
                  key={job._id}
                  rank={idx + 1}
                  label={job.title}
                  value={job.applicationCount}
                  max={topJobsMax}
                  color="#b91c1c"
                />
              ))}
            </div>
          )}
        </ChartCard>
      </section>
    </div>
  );
};

export default AdminDashboard;
