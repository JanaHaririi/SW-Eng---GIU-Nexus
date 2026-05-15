// Frontend/src/app.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import PrivateRoute from './components/privateRoute';
import RoleRoute from './components/roleRoute';
import Navbar from './components/navbar';
import Footer from './components/footer';

// Public Pages
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import ForgotPasswordPage from './pages/forgotPasswordPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import JobListPage from './pages/jobListPage';
import JobDetailPage from './pages/jobDetailPage';

// Job Seeker Pages
import ProfilePage from './pages/profilePage';
import EditProfilePage from './pages/editProfilePage';
import ChangePasswordPage from './pages/changePasswordPage';
import RecommendedJobsPage from './pages/recommendedJobsPage';
import SavedJobsPage from './pages/savedJobsPage';
import MyApplicationsPage from './pages/myApplicationsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/recruiterDashboard';
import CreateJobPage from './pages/recruiter/createJobPage';
import EditJobPage from './pages/recruiter/editJobPage';
import ApplicantsPage from './pages/recruiter/applicantsPage';

// Admin Pages
import AdminDashboard from './pages/admin/adminDashboard';
import AdminUsersPage from './pages/admin/adminUsersPage';
import AdminJobsPage from './pages/admin/adminJobsPage';
import PendingRecruitersPage from './pages/admin/pendingRecruitersPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app-container">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                            <Route path="/jobs" element={<JobListPage />} />
                            <Route path="/jobs/:id" element={<JobDetailPage />} />

                            {/* Protected Routes - Job Seeker */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/profile/edit" element={<EditProfilePage />} />
                                <Route path="/profile/change-password" element={<ChangePasswordPage />} />
                                <Route path="/jobs/recommended" element={<RecommendedJobsPage />} />
                                <Route path="/jobs/saved" element={<SavedJobsPage />} />
                                <Route path="/applications/my" element={<MyApplicationsPage />} />
                            </Route>

                            {/* Recruiter Routes */}
                            <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
                                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                                <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />
                                <Route path="/recruiter/jobs/:id/edit" element={<EditJobPage />} />
                                <Route path="/recruiter/jobs/:jobId/applicants" element={<ApplicantsPage />} />
                            </Route>

                            {/* Admin Routes */}
                            <Route element={<RoleRoute allowedRoles={['admin']} />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<AdminUsersPage />} />
                                <Route path="/admin/jobs" element={<AdminJobsPage />} />
                                <Route path="/admin/pending-recruiters" element={<PendingRecruitersPage />} />
                            </Route>
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;