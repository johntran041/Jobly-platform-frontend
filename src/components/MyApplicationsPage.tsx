// src/components/MyApplicationsPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationAPI } from "../services/api";
import type { Application } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function MyApplicationsPage() {
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await applicationAPI.getMyApplications();

      console.log("📦 Raw response:", data);

      // Backend returns: { status, results, data: { applications: [...] } }
      // After handleResponse: { applications: [...] }
      if (data.applications && Array.isArray(data.applications)) {
        setApplications(data.applications);
        console.log("✅ Set applications:", data.applications.length);
      } else if (Array.isArray(data)) {
        // Fallback if response is just an array
        setApplications(data);
        console.log("✅ Set applications (array):", data.length);
      } else {
        console.error("❌ Unexpected response format:", data);
        setApplications([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: number) => {
    console.log("🔴 Withdraw clicked! Application ID:", applicationId);

    // Show confirmation modal instead of window.confirm
    setApplicationToWithdraw(applicationId);
    setShowConfirmModal(true);
  };

  const confirmWithdraw = async () => {
    if (!applicationToWithdraw) return;

    console.log("✅ User confirmed withdrawal, proceeding...");

    try {
      setWithdrawingId(applicationToWithdraw);
      setShowConfirmModal(false);
      console.log("📡 Calling API to withdraw application...");

      await applicationAPI.withdraw(applicationToWithdraw);

      console.log("✅ API call successful, removing from list");

      // Remove from list
      setApplications((prev) =>
        prev.filter((app) => app.id !== applicationToWithdraw)
      );

      alert("Application withdrawn successfully");
    } catch (err: any) {
      console.error("Failed to withdraw application:", err);
      alert(err.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
      setApplicationToWithdraw(null);
    }
  };

  const cancelWithdraw = () => {
    console.log("❌ User cancelled withdrawal");
    setShowConfirmModal(false);
    setApplicationToWithdraw(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-dark";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "REVIEWED":
        return "👀";
      case "INTERVIEW":
        return "🗣️";
      case "ACCEPTED":
        return "✅";
      case "REJECTED":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link to="/jobs" className="navbar-brand">
            💼 Job Platform
          </Link>

          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">Hello, {user?.username}</span>
            <Link to="/jobs" className="btn btn-outline-light btn-sm me-2">
              Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-outline-light btn-sm me-2">
              Profile
            </Link>
            <button onClick={logout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Applications</h2>
          <Link to="/jobs" className="btn btn-primary">
            Browse More Jobs
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-primary">{applications.length}</h3>
                <p className="text-muted mb-0">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-warning">
                  {applications.filter((a) => a.status === "PENDING").length}
                </h3>
                <p className="text-muted mb-0">Pending</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-info">
                  {
                    applications.filter(
                      (a) => a.status === "REVIEWED" || a.status === "INTERVIEW"
                    ).length
                  }
                </h3>
                <p className="text-muted mb-0">In Progress</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-success">
                  {applications.filter((a) => a.status === "ACCEPTED").length}
                </h3>
                <p className="text-muted mb-0">Accepted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>📭</div>
            <h4 className="mt-3">No Applications Yet</h4>
            <p className="text-muted">
              You haven't applied to any jobs yet. Start browsing!
            </p>
            <Link to="/jobs" className="btn btn-primary mt-3">
              Browse Jobs
            </Link>
          </div>
        ) : (
          /* Applications List */
          <div className="row g-3">
            {applications.map((application) => (
              <div key={application.id} className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Job Info */}
                      <div className="col-md-6">
                        <h5 className="card-title mb-2">
                          {application.jobPosting?.title || "Job Title"}
                        </h5>
                        <p className="text-muted mb-2">
                          <small>
                            🏢{" "}
                            {application.jobPosting?.recruiter?.companyName ||
                              "Company"}
                            <br />
                            📍 {application.jobPosting?.location || "Location"}
                            {application.jobPosting?.salary && (
                              <>
                                <br />
                                💰 {application.jobPosting.salary}
                              </>
                            )}
                          </small>
                        </p>
                      </div>

                      {/* Status & Date */}
                      <div className="col-md-3">
                        <div className="mb-2">
                          <span
                            className={`badge ${getStatusBadgeClass(
                              application.status
                            )} fs-6`}
                          >
                            {getStatusIcon(application.status)}{" "}
                            {application.status}
                          </span>
                        </div>
                        <small className="text-muted">
                          Applied:{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </small>
                        {application.coverLetter && (
                          <>
                            <br />
                            <small className="text-success">
                              ✓ Cover letter included
                            </small>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-md-3 text-end">
                        <Link
                          to={`/jobs/${application.jobPostingId}`}
                          className="btn btn-outline-primary btn-sm d-block mb-2"
                        >
                          View Job
                        </Link>

                        {application.status === "PENDING" && (
                          <button
                            className="btn btn-outline-danger btn-sm d-block"
                            onClick={() => handleWithdraw(application.id)}
                            disabled={withdrawingId === application.id}
                          >
                            {withdrawingId === application.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Withdrawing...
                              </>
                            ) : (
                              "Withdraw"
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-muted">
                          <strong>Cover Letter:</strong>
                        </small>
                        <p className="small mb-0 mt-1">
                          {application.coverLetter.length > 200
                            ? application.coverLetter.substring(0, 200) + "..."
                            : application.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add spacing at bottom */}
      <div className="mb-5"></div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Withdrawal</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelWithdraw}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to withdraw this application?</p>
                <p className="text-danger mb-0">
                  <small>
                    <strong>This action cannot be undone.</strong>
                  </small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelWithdraw}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmWithdraw}
                  disabled={withdrawingId !== null}
                >
                  {withdrawingId ? "Withdrawing..." : "Yes, Withdraw"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
