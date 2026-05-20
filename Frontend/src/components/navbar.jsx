import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import logoLight from '../assets/logo.svg';
import logoDark from '../assets/logo-dark.svg';

const linkBase =
  'inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150';
const linkIdle =
  'text-ink-muted hover:text-ink hover:bg-surface-muted';
const linkActive =
  'bg-primary text-primary-fg font-semibold shadow-sm';

function navLinkClass({ isActive }) {
  return `${linkBase} ${isActive ? linkActive : linkIdle}`;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const role = user?.role;
  const logoUrl = theme === 'dark' ? logoDark : logoLight;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          aria-label="GIU Nexus — Home"
          className="flex shrink-0 items-center text-primary transition-opacity hover:opacity-80"
        >
          <img src={logoUrl} alt="GIU Nexus" className="h-7 w-auto" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            Jobs
          </NavLink>

          {isAuthenticated && role === 'jobSeeker' && (
            <>
              <NavLink to="/recommended" className={navLinkClass}>
                Recommended
              </NavLink>
              <NavLink to="/saved" className={navLinkClass}>
                Saved
              </NavLink>
              <NavLink to="/applications" className={navLinkClass}>
                My Applications
              </NavLink>
            </>
          )}

          {isAuthenticated && role === 'recruiter' && (
            <>
              <NavLink to="/recruiter" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recruiter/jobs/new" className={navLinkClass}>
                Post Job
              </NavLink>
            </>
          )}

          {isAuthenticated && role === 'admin' && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/pending-recruiters" className={navLinkClass}>
                Pending
              </NavLink>
              <NavLink to="/admin/applications" className={navLinkClass}>
                Applications
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm font-medium text-ink-muted lg:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--color-focus-ring)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--color-focus-ring)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
