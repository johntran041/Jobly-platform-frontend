// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { JobListPage } from "./components/JobListPage";
import { JobDetailPage } from "./components/JobDetailPage";
import { MyApplicationsPage } from "./components/MyApplicationsPage";
import { CandidateProfilePage } from "./components/CandidateProfilePage";
import { CreateJobPage } from "./components/CreateJobPage";
import { MyJobsPage } from "./components/MyJobsPage";
import { ViewApplicationsPage } from "./components/ViewApplicationsPage";

import "./App.css";

// This component contains the actual routes and uses the auth context
function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route - Home is job listings */}
      <Route path="/" element={<JobListPage />} />

      {/* Public route - Login page */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Public route - Register page */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Public routes - Job details */}
      <Route path="/jobs/:id" element={<JobDetailPage />} />

      {/* Protected routes - Candidate */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <div className="container mt-5">
              <h2>Dashboard - Coming Soon</h2>
              <p>Welcome, {user.username}!</p>
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/my-applications"
        element={
          user && user.role === "CANDIDATE" ? (
            <MyApplicationsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          user && user.role === "CANDIDATE" ? (
            <CandidateProfilePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Protected routes - Recruiter */}
      <Route
        path="/my-jobs"
        element={
          user && user.role === "RECRUITER" ? (
            <MyJobsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/my-jobs/:jobId/applications"
        element={
          user && user.role === "RECRUITER" ? (
            <ViewApplicationsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/create-job"
        element={
          user && user.role === "RECRUITER" ? (
            <CreateJobPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch all - redirect to jobs */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
}

// Main App component wraps everything in AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
