// src/components/CandidateProfilePage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function CandidateProfilePage() {
  const { user, updateUser, logout } = useAuth();

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [resume, setResume] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load current profile data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setSkills(user.skills || "");
      setExperience(user.experience || "");
      setEducation(user.education || "");
      setResume(user.resume || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // Send all fields - empty strings are okay
      const profileData: any = {
        fullName: fullName,
        phone: phone,
        skills: skills,
        experience: experience,
        education: education,
        resume: resume,
      };

      console.log("📤 Sending profile update:", profileData);

      // Use updateUser from context - it handles API call and state update
      await updateUser(profileData);

      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("❌ Failed to update profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
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
            <Link
              to="/my-applications"
              className="btn btn-outline-light btn-sm me-2"
            >
              My Applications
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
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">👤 My Profile</h4>
              </div>
              <div className="card-body">
                {/* Success Message */}
                {success && (
                  <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                  >
                    ✅ Profile updated successfully!
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccess(false)}
                    ></button>
                  </div>
                )}

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

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  {/* Account Info (Read-only) */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">Account Information</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Email</label>
                        <input
                          type="text"
                          className="form-control"
                          value={user?.email || ""}
                          disabled
                        />
                        <small className="text-muted">
                          Email cannot be changed
                        </small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">
                          Username
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={user?.username || ""}
                          disabled
                        />
                        <small className="text-muted">
                          Username cannot be changed
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">Personal Information</h5>
                    <div className="mb-3">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., 555-0123"
                      />
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">
                      Professional Information
                    </h5>

                    <div className="mb-3">
                      <label className="form-label">Skills</label>
                      <input
                        type="text"
                        className="form-control"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g., JavaScript, React, Node.js, Python"
                      />
                      <small className="text-muted">
                        Separate skills with commas
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Experience</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Describe your work experience, projects, and achievements..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Education</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g., BS Computer Science, University Name, Year"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Resume/CV Link</label>
                      <input
                        type="url"
                        className="form-control"
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        placeholder="https://example.com/my-resume.pdf"
                      />
                      <small className="text-muted">
                        Link to your resume (Google Drive, Dropbox, personal
                        website, etc.)
                      </small>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <Link
                      to="/my-applications"
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        "💾 Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Helper Info */}
            <div className="alert alert-info mt-3">
              <strong>💡 Tip:</strong> Keep your profile up-to-date to improve
              your chances of getting hired! Recruiters can see your profile
              when you apply for jobs.
            </div>
          </div>
        </div>
      </div>

      {/* Add spacing at bottom */}
      <div className="mb-5"></div>
    </div>
  );
}
