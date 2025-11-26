// src/components/MyJobsPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobAPI } from "../services/api";
import type { JobPosting } from "../types";

export function MyJobsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch recruiter's jobs on mount
  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await jobAPI.getMyJobs();
      console.log("📥 Fetched my jobs:", response);

      // Response is { jobs: JobPosting[] } after handleResponse extracts data
      const jobsArray = Array.isArray(response)
        ? response
        : response.jobs || [];
      setJobs(jobsArray);
    } catch (err: any) {
      console.error("❌ Failed to fetch jobs:", err);
      setError(err.message || "Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (jobId: number, currentStatus: boolean) => {
    try {
      setActionLoading(jobId);

      await jobAPI.update(jobId, { isActive: !currentStatus });

      console.log(
        `✅ Job ${jobId} ${!currentStatus ? "activated" : "deactivated"}`
      );

      // Refresh the list
      await fetchMyJobs();
    } catch (err: any) {
      console.error("❌ Failed to update job status:", err);
      alert(err.message || "Failed to update job status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobTitle}"? This will deactivate the job posting.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(jobId);

      await jobAPI.delete(jobId);

      console.log(`✅ Job ${jobId} deleted`);

      // Refresh the list
      await fetchMyJobs();
    } catch (err: any) {
      console.error("❌ Failed to delete job:", err);
      alert(err.message || "Failed to delete job");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewApplications = (jobId: number) => {
    navigate(`/my-jobs/${jobId}/applications`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">
            💼 Job Platform
          </Link>

          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              {user?.companyName || user?.username}
            </span>
            <Link to="/" className="btn btn-outline-light btn-sm me-2">
              Browse Jobs
            </Link>
            <Link
              to="/create-job"
              className="btn btn-outline-light btn-sm me-2"
            >
              Post Job
            </Link>
            <button onClick={logout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>📋 My Job Postings</h2>
          <Link to="/create-job" className="btn btn-success">
            ➕ Post New Job
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            ❌ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="card shadow text-center py-5">
            <div className="card-body">
              <div style={{ fontSize: "4rem" }}>📭</div>
              <h4 className="mt-3">No Job Postings Yet</h4>
              <p className="text-muted">
                Start hiring by posting your first job!
              </p>
              <Link to="/create-job" className="btn btn-success mt-3">
                ➕ Post Your First Job
              </Link>
            </div>
          </div>
        ) : (
          /* Jobs List */
          <div className="row">
            {jobs.map((job) => {
              const applicationCount = (job as any)._count?.applications || 0;

              return (
                <div key={job.id} className="col-12 mb-3">
                  <div
                    className={`card shadow ${
                      !job.isActive ? "border-danger" : ""
                    }`}
                  >
                    <div className="card-body">
                      <div className="row">
                        {/* Left Side - Job Info */}
                        <div className="col-md-8">
                          <div className="d-flex align-items-start">
                            <div className="flex-grow-1">
                              <h5 className="card-title mb-2">
                                {job.title}
                                {!job.isActive && (
                                  <span className="badge bg-danger ms-2">
                                    Inactive
                                  </span>
                                )}
                              </h5>

                              <div className="text-muted small mb-2">
                                <span className="me-3">📍 {job.location}</span>
                                <span className="me-3">🏢 {job.industry}</span>
                                <span className="me-3">⏰ {job.jobType}</span>
                                {job.salary && (
                                  <span className="me-3">💰 {job.salary}</span>
                                )}
                              </div>

                              <p className="card-text mb-2">
                                {job.description.length > 150
                                  ? `${job.description.substring(0, 150)}...`
                                  : job.description}
                              </p>

                              <div className="small text-muted">
                                <span className="me-3">
                                  👁️ {job.views} views
                                </span>
                                <span>
                                  📅 Posted {formatDate(job.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Actions */}
                        <div className="col-md-4">
                          <div className="d-flex flex-column h-100 justify-content-between">
                            {/* Application Count */}
                            <div className="text-center mb-3">
                              <div
                                className="display-6 fw-bold"
                                style={{ color: "#198754" }}
                              >
                                {applicationCount}
                              </div>
                              <div className="text-muted small">
                                Application{applicationCount !== 1 ? "s" : ""}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleViewApplications(job.id)}
                                disabled={actionLoading === job.id}
                              >
                                👥 View Applications
                              </button>

                              <Link
                                to={`/jobs/${job.id}`}
                                className="btn btn-outline-secondary btn-sm"
                              >
                                👁️ View Job
                              </Link>

                              <button
                                className={`btn btn-sm ${
                                  job.isActive
                                    ? "btn-outline-warning"
                                    : "btn-outline-success"
                                }`}
                                onClick={() =>
                                  handleToggleActive(job.id, job.isActive)
                                }
                                disabled={actionLoading === job.id}
                              >
                                {actionLoading === job.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : job.isActive ? (
                                  "⏸️ Deactivate"
                                ) : (
                                  "▶️ Activate"
                                )}
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(job.id, job.title)}
                                disabled={actionLoading === job.id}
                              >
                                {actionLoading === job.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  "🗑️ Delete"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {jobs.length > 0 && (
          <div className="card shadow mt-4">
            <div className="card-body">
              <h5 className="card-title">📊 Summary</h5>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="display-6 text-success">{jobs.length}</div>
                  <div className="text-muted">Total Jobs</div>
                </div>
                <div className="col-md-3">
                  <div className="display-6 text-success">
                    {jobs.filter((j) => j.isActive).length}
                  </div>
                  <div className="text-muted">Active Jobs</div>
                </div>
                <div className="col-md-3">
                  <div className="display-6 text-success">
                    {jobs.reduce(
                      (sum, j) => sum + ((j as any)._count?.applications || 0),
                      0
                    )}
                  </div>
                  <div className="text-muted">Total Applications</div>
                </div>
                <div className="col-md-3">
                  <div className="display-6 text-success">
                    {jobs.reduce((sum, j) => sum + j.views, 0)}
                  </div>
                  <div className="text-muted">Total Views</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add spacing at bottom */}
      <div className="mb-5"></div>
    </div>
  );
}
