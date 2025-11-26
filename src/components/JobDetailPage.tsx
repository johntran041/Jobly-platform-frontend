// src/components/JobDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobAPI, applicationAPI } from "../services/api";
import type { JobPosting } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if already applied
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob(parseInt(id));
    }
  }, [id]);

  // Check if user already applied when job loads
  useEffect(() => {
    if (job && user && isCandidate) {
      checkIfApplied();
    }
  }, [job, user]);

  const checkIfApplied = async () => {
    try {
      setCheckingApplication(true);
      const applications = await applicationAPI.getMyApplications();

      // Check if any application matches this job
      const applied = applications.applications?.some(
        (app: any) => app.jobPostingId === job?.id
      );

      setHasApplied(applied);
    } catch (err) {
      console.error("Failed to check application status:", err);
    } finally {
      setCheckingApplication(false);
    }
  };

  const fetchJob = async (jobId: number) => {
    try {
      setLoading(true);
      setError("");
      const jobData = await jobAPI.getById(jobId);

      // Backend returns: { job: JobPosting }
      setJob(jobData.job);
    } catch (err: any) {
      console.error("Failed to fetch job:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      // Redirect to login page
      navigate("/login");
      return;
    }

    if (!isCandidate) {
      alert(
        "Only candidates can apply for jobs. Please login with a candidate account."
      );
      return;
    }

    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) return;

    try {
      setApplying(true);
      await applicationAPI.apply({
        jobPostingId: job.id,
        coverLetter: coverLetter || undefined,
      });

      setApplySuccess(true);
      setHasApplied(true); // Mark as applied immediately
      setTimeout(() => {
        setShowApplyModal(false);
        navigate("/my-applications");
      }, 2000);
    } catch (err: any) {
      console.error("Application failed:", err);
      alert(
        err.message ||
          "Failed to submit application. You may have already applied."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || "Job not found"}
        </div>
        <Link to="/" className="btn btn-primary">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Simple Navbar */}
      <nav className="navbar navbar-light bg-light mb-4">
        <div className="container">
          <Link to="/" className="btn btn-outline-primary btn-sm">
            ← Back to Jobs
          </Link>
        </div>
      </nav>

      <div className="container">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h1 className="card-title mb-3">{job.title}</h1>

                <div className="mb-4">
                  <p className="text-muted mb-2">
                    <strong>🏢 Company:</strong>{" "}
                    {job.recruiter?.companyName || "Company"}
                  </p>
                  <p className="text-muted mb-2">
                    <strong>📍 Location:</strong> {job.location}
                  </p>
                  {job.salary && (
                    <p className="text-success fw-bold mb-2">
                      <strong>💰 Salary:</strong> {job.salary}
                    </p>
                  )}
                  <p className="mb-2">
                    <span className="badge bg-primary me-2">
                      {job.industry}
                    </span>
                    <span className="badge bg-secondary me-2">
                      {job.jobType.replace("_", " ")}
                    </span>
                    <span className="badge bg-info">👁️ {job.views} views</span>
                  </p>
                </div>

                <hr />

                <div className="mb-4">
                  <h4>Job Description</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
                </div>

                <hr />

                <div className="mb-4">
                  <h4>Requirements</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{job.requirements}</p>
                </div>

                <hr />

                <div className="mb-3">
                  <small className="text-muted">
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
              <div className="card-body">
                <h5 className="card-title mb-4">Apply for this position</h5>

                {applySuccess ? (
                  <div className="alert alert-success">
                    ✅ Application submitted successfully!
                  </div>
                ) : (
                  <>
                    {!user && (
                      <div className="alert alert-info small mb-3">
                        Please login or register to apply
                      </div>
                    )}

                    {hasApplied ? (
                      <div className="alert alert-success">
                        ✅ You've already applied for this job!
                        <hr />
                        <Link
                          to="/my-applications"
                          className="btn btn-sm btn-primary w-100"
                        >
                          View My Applications
                        </Link>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary w-100 btn-lg"
                        onClick={handleApplyClick}
                        disabled={checkingApplication}
                      >
                        {checkingApplication ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Checking...
                          </>
                        ) : user && isCandidate ? (
                          "📝 Apply Now"
                        ) : (
                          "🔐 Login to Apply"
                        )}
                      </button>
                    )}
                  </>
                )}

                <hr />

                <div className="mt-3">
                  <h6 className="mb-3">Job Details</h6>
                  <ul className="list-unstyled small">
                    <li className="mb-2">
                      <strong>Industry:</strong> {job.industry}
                    </li>
                    <li className="mb-2">
                      <strong>Job Type:</strong> {job.jobType.replace("_", " ")}
                    </li>
                    <li className="mb-2">
                      <strong>Location:</strong> {job.location}
                    </li>
                    {job.salary && (
                      <li className="mb-2">
                        <strong>Salary:</strong> {job.salary}
                      </li>
                    )}
                    <li className="mb-2">
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          job.isActive ? "text-success" : "text-danger"
                        }
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </span>
                    </li>
                  </ul>
                </div>

                {job.recruiter && (
                  <>
                    <hr />
                    <div>
                      <h6 className="mb-2">Contact</h6>
                      <p className="small mb-1">{job.recruiter.companyName}</p>
                      <p className="small text-muted">{job.recruiter.email}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply for {job.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                ></button>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="modal-body">
                  {applySuccess ? (
                    <div className="alert alert-success">
                      ✅ Application submitted successfully! Redirecting...
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label">
                          Cover Letter (Optional)
                        </label>
                        <textarea
                          className="form-control"
                          rows={5}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Tell the employer why you're a great fit for this role..."
                        />
                        <small className="text-muted">
                          A cover letter can increase your chances of getting
                          hired!
                        </small>
                      </div>

                      <div className="alert alert-info small">
                        <strong>Your Profile:</strong>
                        <br />
                        Name: {user?.fullName || user?.username}
                        <br />
                        Email: {user?.email}
                        {user?.skills && (
                          <>
                            <br />
                            Skills: {user.skills}
                          </>
                        )}
                        {user?.experience && (
                          <>
                            <br />
                            Experience: {user.experience}
                          </>
                        )}
                        {user?.education && (
                          <>
                            <br />
                            Education: {user.education}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {!applySuccess && (
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowApplyModal(false)}
                      disabled={applying}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={applying}
                    >
                      {applying ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5"></div>
    </div>
  );
}
