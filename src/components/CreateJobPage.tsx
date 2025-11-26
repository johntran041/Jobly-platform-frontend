// src/components/CreateJobPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobAPI } from "../services/api";
import type { CreateJobData } from "../types";

export function CreateJobPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobType, setJobType] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Job title is required");
      return;
    }

    if (!description.trim()) {
      setError("Job description is required");
      return;
    }

    if (!requirements.trim()) {
      setError("Job requirements are required");
      return;
    }

    if (!location.trim()) {
      setError("Location is required");
      return;
    }

    if (!industry) {
      setError("Please select an industry");
      return;
    }

    if (!jobType) {
      setError("Please select a job type");
      return;
    }

    setLoading(true);

    try {
      const jobData: CreateJobData = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        salary: salary.trim() || undefined,
        location: location.trim(),
        industry,
        jobType,
      };

      console.log("📤 Creating job:", jobData);

      await jobAPI.create(jobData);

      console.log("✅ Job created successfully");

      // Redirect to My Jobs page
      navigate("/my-jobs");
    } catch (err: any) {
      console.error("❌ Failed to create job:", err);
      setError(err.message || "Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">📝 Post a New Job</h4>
              </div>
              <div className="card-body">
                {/* Error Message */}
                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                  >
                    ❌ {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                {/* Job Posting Form */}
                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">Basic Information</h5>

                    <div className="mb-3">
                      <label className="form-label">
                        Job Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Job Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Provide a detailed description of the role, responsibilities, and what the ideal candidate will be doing..."
                      />
                      <small className="text-muted">
                        Include role overview, key responsibilities, and what
                        makes this opportunity exciting
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Requirements <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        required
                        placeholder="List the qualifications, skills, and experience required for this position..."
                      />
                      <small className="text-muted">
                        Include education, years of experience, technical
                        skills, and any certifications needed
                      </small>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">Job Details</h5>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Industry <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          required
                        >
                          <option value="">Select an industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Job Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                          required
                        >
                          <option value="">Select a job type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Temporary">Temporary</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Location <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder="e.g., Ho Chi Minh City, Vietnam or Remote"
                      />
                      <small className="text-muted">
                        Include city, country, or specify if it's a remote
                        position
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Salary Range</label>
                      <input
                        type="text"
                        className="form-control"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="e.g., $50,000 - $70,000 per year or Negotiable"
                      />
                      <small className="text-muted">
                        Optional: Include salary range or benefits package
                      </small>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <Link to="/my-jobs" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Creating...
                        </>
                      ) : (
                        "📢 Post Job"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Helper Info */}
            <div className="alert alert-info mt-3">
              <strong>💡 Tips for a great job posting:</strong>
              <ul className="mb-0 mt-2">
                <li>Be clear and specific about the role and requirements</li>
                <li>Highlight what makes your company unique</li>
                <li>
                  Include salary information to attract quality candidates
                </li>
                <li>Use keywords that candidates might search for</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add spacing at bottom */}
      <div className="mb-5"></div>
    </div>
  );
}
