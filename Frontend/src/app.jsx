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
import AdminApplicationsPage from "./pages/admin/adminApplicationsPage";

import RecruiterDashboard from './pages/recruiter/recruiterDashboard.jsx';
import CreateJobPage from './pages/recruiter/createJobPage.jsx';
import EditJobPage from './pages/recruiter/editJobPage.jsx';
import ApplicantsPage from './pages/recruiter/applicantsPage.jsx';

import MyApplicationsPage from './pages/myApplicationsPage.jsx';

import JobListPage from './pages/jobListPage.jsx';
import JobDetailPage from './pages/jobDetailPage.jsx';
import SavedJobsPage from './pages/savedJobsPage.jsx';

/* =========================
   AI LOGIC PAGES
========================= */
import HomePage from './pages/HomePage.jsx';
import RecommendedJobsPage from './pages/RecommendedJobsPage.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminJobsPage from './pages/admin/AdminJobsPage.jsx';

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Page not found
      </h1>

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

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          {/* AI Logic */}
          <Route
            path="/"
            element={<HomePage />}
          />

          {/* Team Lead */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Security */}
          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Search */}
          <Route
            path="/jobs"
            element={<JobListPage />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetailPage />}
          />

          {/* =========================
              AUTHENTICATED ROUTES
          ========================= */}

          <Route element={<PrivateRoute />}>

            <Route
              path="/change-password"
              element={<ChangePasswordPage />}
            />

            <Route
              path="/profile"
              element={<div>Profile Page Coming Soon</div>}
            />

            <Route
              path="/profile/edit"
              element={<div>Edit Profile Coming Soon</div>}
            />

          </Route>

          {/* =========================
              JOB SEEKER ROUTES
          ========================= */}

          <Route element={<RoleRoute allow={['jobSeeker']} />}>

            <Route
              path="/saved"
              element={<SavedJobsPage />}
            />

            <Route
              path="/applications"
              element={<MyApplicationsPage />}
            />

            <Route
              path="/recommended"
              element={<RecommendedJobsPage />}
            />

          </Route>

          {/* =========================
              RECRUITER ROUTES
          ========================= */}

          <Route element={<RoleRoute allow={['recruiter']} />}>

            <Route
              path="/recruiter"
              element={<RecruiterDashboard />}
            />

            <Route
              path="/recruiter/jobs/new"
              element={<CreateJobPage />}
            />

            <Route
              path="/recruiter/jobs/:id/edit"
              element={<EditJobPage />}
            />

            <Route
              path="/recruiter/jobs/:jobId/applicants"
              element={<ApplicantsPage />}
            />

          </Route>

          {/* =========================
              ADMIN ROUTES
          ========================= */}

          <Route element={<RoleRoute allow={['admin']} />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/jobs"
              element={<AdminJobsPage />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsersPage />}
            />

            <Route
              path="/admin/users/:id"
              element={<div>Admin User Profile Coming Soon</div>}
            />

            <Route
              path="/admin/pending-recruiters"
              element={<PendingRecruitersPage />}
            />

            <Route
              path="/admin/applications"
              element={<AdminApplicationsPage />}
            />

          </Route>

          {/* =========================
              404
          ========================= */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}