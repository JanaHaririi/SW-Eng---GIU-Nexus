import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import JobCard from '../components/JobCard';
import Skeleton from '../components/Skeleton';

import { getJobs, getRecommendedJobs } from '../services/jobService';
import { useAuth } from '../context/authContext';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Hello';
}

function getFirstName(user) {
  if (!user?.name) return '';
  return user.name.trim().split(' ')[0];
}

function getHeroConfig({ isAuthenticated, user }) {
  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();

  if (!isAuthenticated) {
    return {
      title: 'Find your next role at GIU Nexus',
      subtitle:
        'AI-matched internships and jobs for German International University students — and the recruiters who want to hire them.',
      primaryAction: { label: 'Browse jobs', href: '/jobs' },
      secondaryAction: { label: 'Create account', href: '/register' },
    };
  }

  if (user?.role === 'jobSeeker') {
    return {
      title: `${greeting}, ${firstName} 👋`,
      subtitle:
        'Here are jobs picked for your profile. Update your bio anytime to sharpen the matches.',
      primaryAction: { label: 'See recommendations', href: '/recommended' },
      secondaryAction: { label: 'Update profile', href: '/profile' },
    };
  }

  if (user?.role === 'recruiter') {
    return {
      title: `${greeting}, ${firstName} 👋`,
      subtitle:
        'Post a new opening or review applicants on your existing roles.',
      primaryAction: { label: 'Post a job', href: '/recruiter/jobs/new' },
      secondaryAction: { label: 'My job posts', href: '/recruiter' },
    };
  }

  if (user?.role === 'admin') {
    return {
      title: `${greeting}, ${firstName}`,
      subtitle: 'Platform stats, pending recruiters, and live activity.',
      primaryAction: { label: 'Open dashboard', href: '/admin' },
      secondaryAction: {
        label: 'Pending recruiters',
        href: '/admin/pending-recruiters',
      },
    };
  }

  return {
    title: `${greeting}${firstName ? `, ${firstName}` : ''}`,
    subtitle: 'Welcome to GIU Nexus.',
    primaryAction: { label: 'Browse jobs', href: '/jobs' },
  };
}

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    fetchJobs();

    if (isAuthenticated && user?.role === 'jobSeeker') {
      fetchRecommendedJobs();
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const data = await getRecommendedJobs();
      setRecommendedJobs(data.jobs || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const hero = getHeroConfig({ isAuthenticated, user });
  const isJobSeeker = isAuthenticated && user?.role === 'jobSeeker';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-2xl bg-red-700 p-8 text-white shadow-md sm:p-10"
        style={{
          backgroundColor: '#b91c1c',
          backgroundImage:
            'linear-gradient(135deg, #b91c1c 0%, #991b1b 55%, #7f1d1d 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rotate-45 rounded-3xl bg-white/10 sm:-right-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rotate-45 rounded-3xl bg-white/5"
        />

        <div className="relative max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {hero.title}
          </h1>
          <p className="mt-3 text-base text-white/90 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {hero.primaryAction && (
              <Link
                to={hero.primaryAction.href}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/95"
              >
                {hero.primaryAction.label}
              </Link>
            )}
            {hero.secondaryAction && (
              <Link
                to={hero.secondaryAction.href}
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                {hero.secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* RECOMMENDED FOR YOU */}
      {isJobSeeker && (
        <section className="mt-12">
          <SectionHeader
            eyebrow="Personalized"
            title="Recommended for you"
            viewAllHref="/recommended"
          />

          {loadingRecommended ? (
            <SkeletonGrid count={3} />
          ) : recommendedJobs.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Add a bio with the skills you have on your profile, then click Extract Skills."
              actionLabel="Update profile"
              actionHref="/profile"
            />
          ) : (
            <JobsGrid jobs={recommendedJobs.slice(0, 3)} showScore />
          )}
        </section>
      )}

      {/* TRENDING JOBS */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Latest"
          title="Trending jobs"
          viewAllHref="/jobs"
        />

        {loadingJobs ? (
          <SkeletonGrid count={6} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            description="Check back soon — new opportunities will land here."
          />
        ) : (
          <JobsGrid jobs={jobs.slice(0, 6)} />
        )}
      </section>
    </div>
  );
};

function SectionHeader({ eyebrow, title, viewAllHref }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

function JobsGrid({ jobs, showScore = false }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} showScore={showScore} />
      ))}
    </div>
  );
}

function SkeletonGrid({ count }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

export default HomePage;
