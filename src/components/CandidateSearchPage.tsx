// src/components/CandidateSearchPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import type { User } from "../types";

export function CandidateSearchPage() {
  const { user, logout } = useAuth();

  // Search filters
  const [keyword, setKeyword] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");

  // Results
  const [candidates, setCandidates] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Expanded candidate details
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const searchParams: any = {};

      if (keyword.trim()) searchParams.keyword = keyword.trim();
      if (skills.trim()) searchParams.skills = skills.trim();
      if (experience.trim()) searchParams.experience = experience.trim();
      if (location.trim()) searchParams.location = location.trim();

      console.log("🔍 Searching candidates with params:", searchParams);

      const response = await userAPI.searchCandidates(searchParams);
      console.log("📥 Search results:", response);

      // Backend returns: { candidates: User[], total: number }
      const candidatesArray = response.candidates || [];
      const totalCount = response.total || candidatesArray.length;

      setCandidates(candidatesArray);
      setTotal(totalCount);
    } catch (err: any) {
      console.error("❌ Search failed:", err);
      setError(err.message || "Failed to search candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSkills("");
    setExperience("");
    setLocation("");
    setCandidates([]);
    setTotal(0);
    setSearched(false);
    setError("");
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
          <h2>🔍 Search Candidates</h2>
          <p className="text-muted">
            Find talented candidates based on their skills, experience, and
            location
          </p>
        </div>

        {/* Search Form */}
        <div className="card shadow mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Keyword</label>
                  <input
                    type="text"
                    className="form-control"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by name, email, or general keyword"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    className="form-control"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                  <small className="text-muted">
                    Search for specific technical skills
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 3 years, senior, intern"
                  />
                  <small className="text-muted">
                    Search by experience level or keywords
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Ho Chi Minh City, Hanoi"
                  />
                  <small className="text-muted">
                    Search by city or country
                  </small>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Searching...
                    </>
                  ) : (
                    "🔍 Search Candidates"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClearFilters}
                  disabled={loading}
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
            ❌ {error}
          </div>
        )}

        {/* Results Header */}
        {searched && !loading && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {total > 0
                ? `Found ${total} candidate${total !== 1 ? "s" : ""}`
                : "No candidates found"}
            </h5>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Searching candidates...</p>
          </div>
        )}

        {/* Empty State - Before Search */}
        {!searched && !loading && (
          <div className="card shadow text-center py-5">
            <div className="card-body">
              <div style={{ fontSize: "4rem" }}>👥</div>
              <h4 className="mt-3">Search for Candidates</h4>
              <p className="text-muted">
                Use the filters above to find candidates with specific skills,
                experience, or location
              </p>
            </div>
          </div>
        )}

        {/* Empty State - No Results */}
        {searched && !loading && candidates.length === 0 && (
          <div className="card shadow text-center py-5">
            <div className="card-body">
              <div style={{ fontSize: "4rem" }}>😔</div>
              <h4 className="mt-3">No Candidates Found</h4>
              <p className="text-muted">
                Try adjusting your search filters or using different keywords
              </p>
            </div>
          </div>
        )}

        {/* Results List */}
        {!loading && candidates.length > 0 && (
          <div className="row">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="col-12 mb-3">
                <div className="card shadow">
                  <div className="card-body">
                    {/* Header - Always Visible */}
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1">
                          {candidate.fullName || "No name provided"}
                          <span className="badge bg-success ms-2">
                            CANDIDATE
                          </span>
                        </h5>
                        <div className="text-muted small mb-2">
                          <span className="me-3">📧 {candidate.email}</span>
                          {candidate.phone && (
                            <span className="me-3">📱 {candidate.phone}</span>
                          )}
                        </div>

                        {/* Skills Preview */}
                        {candidate.skills && (
                          <div className="mb-2">
                            {candidate.skills
                              .split(",")
                              .slice(0, 5)
                              .map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-secondary me-1 mb-1"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            {candidate.skills.split(",").length > 5 && (
                              <span className="badge bg-light text-dark">
                                +{candidate.skills.split(",").length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => toggleExpanded(candidate.id)}
                      >
                        {expandedId === candidate.id ? "▲ Less" : "▼ More"}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === candidate.id && (
                      <div className="mt-3 pt-3 border-top">
                        {/* All Skills */}
                        {candidate.skills && (
                          <div className="mb-3">
                            <strong className="d-block mb-1">🎯 Skills:</strong>
                            <div>
                              {candidate.skills.split(",").map((skill, idx) => (
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
                        {candidate.experience && (
                          <div className="mb-3">
                            <strong className="d-block mb-1">
                              💼 Experience:
                            </strong>
                            <p className="mb-0 text-muted">
                              {candidate.experience}
                            </p>
                          </div>
                        )}

                        {/* Education */}
                        {candidate.education && (
                          <div className="mb-3">
                            <strong className="d-block mb-1">
                              🎓 Education:
                            </strong>
                            <p className="mb-0 text-muted">
                              {candidate.education}
                            </p>
                          </div>
                        )}

                        {/* Resume Link */}
                        {candidate.resume && (
                          <div className="mb-3">
                            <a
                              href={candidate.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              📄 View Resume
                            </a>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="alert alert-info mb-0">
                          <strong>📞 Contact Information:</strong>
                          <div className="mt-2">
                            <div>
                              <strong>Email:</strong>{" "}
                              <a href={`mailto:${candidate.email}`}>
                                {candidate.email}
                              </a>
                            </div>
                            {candidate.phone && (
                              <div>
                                <strong>Phone:</strong>{" "}
                                <a href={`tel:${candidate.phone}`}>
                                  {candidate.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
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
    </div>
  );
}
