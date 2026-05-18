import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const linkBase =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors';
const linkIdle = 'text-slate-700 hover:bg-slate-100';
const linkActive = 'bg-brand-50 text-brand-700';

function navLinkClass({ isActive }) {
  return `${linkBase} ${isActive ? linkActive : linkIdle}`;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-brand-700">
          GIU Nexus
        </Link>

        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
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
