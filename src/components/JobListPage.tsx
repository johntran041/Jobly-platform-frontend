// src/components/JobListPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobAPI } from "../services/api";
import type { JobPosting } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function JobListPage() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterJobType, setFilterJobType] = useState("");

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await jobAPI.getAll({ limit: 100, isActive: true });

      // Backend returns: { status, results, data: { jobs: [...], total, pages } }
      // api.ts handleResponse extracts data, so we get: { jobs: [...], total, pages }
      console.log("📦 Fetched jobs response:", response);

      if (response.jobs && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
        console.log("✅ Set jobs:", response.jobs.length);
      } else {
        console.error("❌ Unexpected response format:", response);
        setJobs([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const params: any = {};
      if (searchKeyword) params.keyword = searchKeyword;
      if (filterLocation) params.location = filterLocation;
      if (filterIndustry) params.industry = filterIndustry;
      if (filterJobType) params.jobType = filterJobType;

      // If no filters, get all jobs
      if (Object.keys(params).length === 0) {
        await fetchJobs();
        return;
      }

      const response = await jobAPI.search(params);
      console.log("🔍 Search response:", response);

      // Backend returns: { status, results, data: { jobs: [...], total, pages } }
      // api.ts handleResponse extracts data, so we get: { jobs: [...], total, pages }
      if (response.jobs && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
        console.log("✅ Search found jobs:", response.jobs.length);
      } else {
        console.error("❌ Unexpected search response format:", response);
        setJobs([]);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setFilterLocation("");
    setFilterIndustry("");
    setFilterJobType("");
    fetchJobs();
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">
            💼 Job Platform
          </Link>

          <div className="navbar-nav ms-auto">
            {user ? (
              <>
                <span className="navbar-text me-3">
                  Hello, {user.username} ({user.role})
                </span>
                {user.role === "CANDIDATE" && (
                  <>
                    <Link
                      to="/my-applications"
                      className="btn btn-outline-light btn-sm me-2"
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/profile"
                      className="btn btn-outline-light btn-sm me-2"
                    >
                      Profile
                    </Link>
                  </>
                )}
                {user.role === "RECRUITER" && (
                  <>
                    <Link
                      to="/my-jobs"
                      className="btn btn-outline-light btn-sm me-2"
                    >
                      My Jobs
                    </Link>
                    <Link
                      to="/create-job"
                      className="btn btn-success btn-sm me-2"
                    >
                      Post Job
                    </Link>
                    <Link
                      to="/search-candidates"
                      className="btn btn-outline-light btn-sm me-2"
                    >
                      Search Candidates
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="btn btn-outline-light btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm me-2">
                  Login
                </Link>
                <Link to="/register" className="btn btn-light btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 mb-3">Find Your Dream Job</h1>
          <p className="lead text-muted">
            Browse thousands of job opportunities
          </p>
        </div>

        {/* Search & Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by job title, company, or keywords..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Location"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterJobType}
                    onChange={(e) => setFilterJobType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full Time</option>
                    <option value="Part-time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  🔍 Search
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </form>
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
            <p className="mt-3">Loading jobs...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-3">
              <h5>{jobs.length} Jobs Found</h5>
            </div>

            {/* Job Cards */}
            {jobs.length === 0 ? (
              <div className="text-center py-5">
                <h4>No jobs found</h4>
                <p className="text-muted">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="row g-4">
                {jobs.map((job) => (
                  <div key={job.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm hover-shadow">
                      <div className="card-body">
                        <h5 className="card-title">{job.title}</h5>

                        <p className="text-muted mb-2">
                          🏢 {job.recruiter?.companyName || "Company"}
                        </p>

                        <p className="text-muted small mb-2">
                          📍 {job.location}
                        </p>

                        {job.salary && (
                          <p className="text-success fw-bold mb-2">
                            💰 {job.salary}
                          </p>
                        )}

                        <div className="mb-3">
                          <span className="badge bg-primary me-1">
                            {job.industry}
                          </span>
                          <span className="badge bg-secondary">
                            {job.jobType.replace("_", " ")}
                          </span>
                        </div>

                        <p className="card-text text-muted small">
                          {job.description.length > 100
                            ? job.description.substring(0, 100) + "..."
                            : job.description}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <small className="text-muted">
                            👁️ {job.views} views
                          </small>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View Details →
                          </Link>
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

      {/* Add some spacing at bottom */}
      <div className="mb-5"></div>

      {/* Add hover effect CSS */}
      <style>{`
        .hover-shadow {
          transition: box-shadow 0.3s ease;
        }
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
