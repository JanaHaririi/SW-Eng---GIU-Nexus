import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function RoleRoute({ allow = [], children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowed = Array.isArray(allow) ? allow : [allow];
  if (allowed.length > 0 && !allowed.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}
