import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Footer from './components/footer.jsx';
import PrivateRoute from './components/privateRoute.jsx';
import RoleRoute from './components/roleRoute.jsx';

import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';

import PendingRecruitersPage from "./pages/admin/PendingRecruitersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
// Teammate-owned pages plug in here as they're built.
// To wire a real page: replace the matching <ComingSoon ... /> below with
// the page component and add its import above.

function ComingSoon({ owner, name }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
      <p className="mt-2 text-slate-600">
        This page is owned by <span className="font-medium">{owner}</span> and
        will be wired up in their PR.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you're looking for doesn't exist.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public — AI Logic */}
          <Route path="/" element={<ComingSoon owner="AI Logic" name="Home" />} />

          {/* Public — Team Lead */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public — Security */}
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Public — Search */}
          <Route
            path="/jobs"
            element={<ComingSoon owner="Search" name="Job List" />}
          />
          <Route
            path="/jobs/:id"
            element={<ComingSoon owner="Search" name="Job Detail" />}
          />

          {/* Authenticated — any role */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/change-password"
              element={<ChangePasswordPage />}
            />

            <Route
              path="/profile"
              element={<ComingSoon owner="Profile" name="Profile" />}
            />
            <Route
              path="/profile/edit"
              element={<ComingSoon owner="Profile" name="Edit Profile" />}
            />
          </Route>

          {/* Job seeker only */}
          <Route element={<RoleRoute allow={['jobSeeker']} />}>
            <Route
              path="/saved"
              element={<ComingSoon owner="Search" name="Saved Jobs" />}
            />
            <Route
              path="/applications"
              element={<ComingSoon owner="Workflow" name="My Applications" />}
            />
            <Route
              path="/recommended"
              element={
                <ComingSoon owner="AI Logic" name="Recommended Jobs" />
              }
            />
          </Route>

          {/* Recruiter only */}
          <Route element={<RoleRoute allow={['recruiter']} />}>
            <Route
              path="/recruiter"
              element={
                <ComingSoon owner="Recruiter" name="Recruiter Dashboard" />
              }
            />
            <Route
              path="/recruiter/jobs/new"
              element={<ComingSoon owner="Recruiter" name="Create Job" />}
            />
            <Route
              path="/recruiter/jobs/:id/edit"
              element={<ComingSoon owner="Recruiter" name="Edit Job" />}
            />
            <Route
              path="/recruiter/jobs/:jobId/applicants"
              element={<ComingSoon owner="Workflow" name="Applicants" />}
            />
          </Route>

          {/* Admin only */}
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route
              path="/admin"
              element={<ComingSoon owner="AI Logic" name="Admin Dashboard" />}
           />

            <Route
             path="/admin/users"
              element={<AdminUsersPage />}
            />

            <Route
             path="/admin/pending-recruiters"
             element={<PendingRecruitersPage />}
            />

            <Route
             path="/admin/jobs"
             element={<ComingSoon owner="AI Logic" name="Admin Jobs" />}
           />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
