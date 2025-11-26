// src/components/ViewApplicationsPage.tsx
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { applicationAPI } from "../services/api";
import type { Application, ApplicationStatus } from "../types";

export function ViewApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await applicationAPI.getForJob(parseInt(jobId!));
      console.log("📥 Fetched applications:", response);

      // Response structure: { job: { id, title }, applications: Application[] }
      if (response && typeof response === "object") {
        const data = response as any;
        if (data.job) {
          setJobTitle(data.job.title);
        }
        if (data.applications) {
          setApplications(data.applications);
        } else if (Array.isArray(data)) {
          // Fallback if response is just an array
          setApplications(data);
        }
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch applications:", err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: number,
    newStatus: ApplicationStatus
  ) => {
    try {
      setUpdatingId(applicationId);

      await applicationAPI.updateStatus(applicationId, newStatus);

      console.log(
        `✅ Application ${applicationId} status updated to ${newStatus}`
      );

      // Refresh the list
      await fetchApplications();
    } catch (err: any) {
      console.error("❌ Failed to update status:", err);
      alert(err.message || "Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-warning";
      case "REVIEWED":
        return "bg-info";
      case "INTERVIEW":
        return "bg-primary";
      case "ACCEPTED":
        return "bg-success";
      case "REJECTED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Filter applications
  const filteredApplications =
    filterStatus === "ALL"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    reviewed: applications.filter((a) => a.status === "REVIEWED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
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
            <Link to="/my-jobs" className="btn btn-outline-light btn-sm me-2">
              My Jobs
            </Link>
            <Link
              to="/create-job"
              className="btn btn-outline-light btn-sm me-2"
            >
              Post Job
            </Link>
            <Link
              to="/search-candidates"
              className="btn btn-outline-light btn-sm me-2"
            >
              Search Candidates
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
        <div className="mb-4">
          <Link to="/my-jobs" className="btn btn-outline-secondary mb-3">
            ← Back to My Jobs
          </Link>
          <h2>👥 Applications for: {jobTitle || `Job #${jobId}`}</h2>
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
            <p className="mt-3 text-muted">Loading applications...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-2">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="h3 mb-0">{stats.total}</div>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card text-center border-warning">
                  <div className="card-body">
                    <div className="h3 mb-0 text-warning">{stats.pending}</div>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card text-center border-info">
                  <div className="card-body">
                    <div className="h3 mb-0 text-info">{stats.reviewed}</div>
                    <small className="text-muted">Reviewed</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card text-center border-primary">
                  <div className="card-body">
                    <div className="h3 mb-0 text-primary">
                      {stats.interview}
                    </div>
                    <small className="text-muted">Interview</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card text-center border-success">
                  <div className="card-body">
                    <div className="h3 mb-0 text-success">{stats.accepted}</div>
                    <small className="text-muted">Accepted</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card text-center border-danger">
                  <div className="card-body">
                    <div className="h3 mb-0 text-danger">{stats.rejected}</div>
                    <small className="text-muted">Rejected</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="card shadow mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <label className="form-label mb-0">Filter by Status:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="btn-group" role="group">
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "ALL"
                            ? "btn-success"
                            : "btn-outline-success"
                        }`}
                        onClick={() => setFilterStatus("ALL")}
                      >
                        All ({stats.total})
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "PENDING"
                            ? "btn-warning"
                            : "btn-outline-warning"
                        }`}
                        onClick={() => setFilterStatus("PENDING")}
                      >
                        Pending ({stats.pending})
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "REVIEWED"
                            ? "btn-info"
                            : "btn-outline-info"
                        }`}
                        onClick={() => setFilterStatus("REVIEWED")}
                      >
                        Reviewed ({stats.reviewed})
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "INTERVIEW"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setFilterStatus("INTERVIEW")}
                      >
                        Interview ({stats.interview})
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "ACCEPTED"
                            ? "btn-success"
                            : "btn-outline-success"
                        }`}
                        onClick={() => setFilterStatus("ACCEPTED")}
                      >
                        Accepted ({stats.accepted})
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterStatus === "REJECTED"
                            ? "btn-danger"
                            : "btn-outline-danger"
                        }`}
                        onClick={() => setFilterStatus("REJECTED")}
                      >
                        Rejected ({stats.rejected})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="card shadow text-center py-5">
                <div className="card-body">
                  <div style={{ fontSize: "4rem" }}>📭</div>
                  <h4 className="mt-3">
                    {filterStatus === "ALL"
                      ? "No Applications Yet"
                      : `No ${filterStatus} Applications`}
                  </h4>
                  <p className="text-muted">
                    {filterStatus === "ALL"
                      ? "Applications will appear here when candidates apply for this job."
                      : "Try selecting a different filter."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="row">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="col-12 mb-3">
                    <div className="card shadow">
                      <div className="card-body">
                        <div className="row">
                          {/* Left Side - Candidate Info */}
                          <div className="col-md-8">
                            <div className="d-flex align-items-start mb-3">
                              <div className="flex-grow-1">
                                <h5 className="card-title mb-1">
                                  {application.candidate?.fullName ||
                                    "No name provided"}
                                  <span
                                    className={`badge ms-2 ${getStatusBadgeClass(
                                      application.status
                                    )}`}
                                  >
                                    {application.status}
                                  </span>
                                </h5>
                                <div className="text-muted small mb-2">
                                  <span className="me-3">
                                    📧 {application.candidate?.email}
                                  </span>
                                  {application.candidate?.phone && (
                                    <span className="me-3">
                                      📱 {application.candidate.phone}
                                    </span>
                                  )}
                                  <span>
                                    📅 Applied{" "}
                                    {formatDate(application.appliedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Skills */}
                            {application.candidate?.skills && (
                              <div className="mb-3">
                                <strong className="d-block mb-1">
                                  🎯 Skills:
                                </strong>
                                <div>
                                  {application.candidate.skills
                                    .split(",")
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="badge bg-secondary me-1 mb-1"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Experience */}
                            {application.candidate?.experience && (
                              <div className="mb-3">
                                <strong className="d-block mb-1">
                                  💼 Experience:
                                </strong>
                                <p className="mb-0 text-muted small">
                                  {application.candidate.experience}
                                </p>
                              </div>
                            )}

                            {/* Education */}
                            {application.candidate?.education && (
                              <div className="mb-3">
                                <strong className="d-block mb-1">
                                  🎓 Education:
                                </strong>
                                <p className="mb-0 text-muted small">
                                  {application.candidate.education}
                                </p>
                              </div>
                            )}

                            {/* Cover Letter */}
                            {application.coverLetter && (
                              <div className="mb-3">
                                <strong className="d-block mb-1">
                                  ✉️ Cover Letter:
                                </strong>
                                <p className="mb-0 text-muted small fst-italic">
                                  "{application.coverLetter}"
                                </p>
                              </div>
                            )}

                            {/* Resume Link */}
                            {application.candidate?.resume && (
                              <div>
                                <a
                                  href={application.candidate.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  📄 View Resume
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Right Side - Status Update */}
                          <div className="col-md-4">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6 className="card-title">Update Status</h6>
                                <div className="d-grid gap-2">
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        application.id,
                                        "PENDING"
                                      )
                                    }
                                    disabled={
                                      updatingId === application.id ||
                                      application.status === "PENDING"
                                    }
                                  >
                                    {updatingId === application.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      "⏳ Pending"
                                    )}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        application.id,
                                        "REVIEWED"
                                      )
                                    }
                                    disabled={
                                      updatingId === application.id ||
                                      application.status === "REVIEWED"
                                    }
                                  >
                                    {updatingId === application.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      "👀 Reviewed"
                                    )}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        application.id,
                                        "INTERVIEW"
                                      )
                                    }
                                    disabled={
                                      updatingId === application.id ||
                                      application.status === "INTERVIEW"
                                    }
                                  >
                                    {updatingId === application.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      "📞 Interview"
                                    )}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        application.id,
                                        "ACCEPTED"
                                      )
                                    }
                                    disabled={
                                      updatingId === application.id ||
                                      application.status === "ACCEPTED"
                                    }
                                  >
                                    {updatingId === application.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      "✅ Accept"
                                    )}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        application.id,
                                        "REJECTED"
                                      )
                                    }
                                    disabled={
                                      updatingId === application.id ||
                                      application.status === "REJECTED"
                                    }
                                  >
                                    {updatingId === application.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      "❌ Reject"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add spacing at bottom */}
      <div className="mb-5"></div>
    </div>
  );
}
