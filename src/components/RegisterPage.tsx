// src/components/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Step 1: Choose role
  const [step, setStep] = useState<"choose-role" | "fill-form">("choose-role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Candidate fields
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");

  // Recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("fill-form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Check password requirements
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const registerData: any = {
        email,
        password,
        username,
        role: selectedRole!,
        fullName,
        phone,
      };

      // Add role-specific fields
      if (selectedRole === "CANDIDATE") {
        registerData.skills = skills;
        registerData.experience = experience;
        registerData.education = education;
      } else if (selectedRole === "RECRUITER") {
        registerData.companyName = companyName;
        registerData.companyInfo = companyInfo;
      }

      await register(registerData);

      // Navigate based on role
      if (selectedRole === "CANDIDATE") {
        navigate("/jobs");
      } else if (selectedRole === "RECRUITER") {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  if (step === "choose-role") {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">👋 Join Our Platform</h2>
                <p className="text-center text-muted mb-4">
                  Choose how you want to use the platform
                </p>

                <div className="row g-3">
                  {/* Candidate Card */}
                  <div className="col-md-6">
                    <div
                      className="card h-100 border-primary cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRoleSelect("CANDIDATE")}
                    >
                      <div className="card-body text-center p-4">
                        <div className="mb-3" style={{ fontSize: "3rem" }}>
                          🎯
                        </div>
                        <h4 className="card-title">I'm a Candidate</h4>
                        <p className="card-text text-muted">
                          Looking for job opportunities
                        </p>
                        <ul className="list-unstyled text-start mt-3">
                          <li>✓ Browse jobs</li>
                          <li>✓ Apply for positions</li>
                          <li>✓ Track applications</li>
                          <li>✓ Build your profile</li>
                        </ul>
                        <button className="btn btn-primary w-100 mt-3">
                          Sign up as Candidate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Card */}
                  <div className="col-md-6">
                    <div
                      className="card h-100 border-success cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRoleSelect("RECRUITER")}
                    >
                      <div className="card-body text-center p-4">
                        <div className="mb-3" style={{ fontSize: "3rem" }}>
                          💼
                        </div>
                        <h4 className="card-title">I'm a Recruiter</h4>
                        <p className="card-text text-muted">
                          Looking to hire talent
                        </p>
                        <ul className="list-unstyled text-start mt-3">
                          <li>✓ Post job openings</li>
                          <li>✓ Review applications</li>
                          <li>✓ Manage candidates</li>
                          <li>✓ Find the best talent</li>
                        </ul>
                        <button className="btn btn-success w-100 mt-3">
                          Sign up as Recruiter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <Link to="/" className="text-decoration-none">
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <button
                  className="btn btn-link text-decoration-none p-0"
                  onClick={() => setStep("choose-role")}
                >
                  ← Back
                </button>
                <h3 className="mb-0 ms-3">
                  {selectedRole === "CANDIDATE"
                    ? "🎯 Candidate"
                    : "💼 Recruiter"}{" "}
                  Registration
                </h3>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Common Fields */}
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Choose a username"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password *</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>

                {/* Candidate-specific fields */}
                {selectedRole === "CANDIDATE" && (
                  <>
                    <hr className="my-4" />
                    <h5 className="mb-3">Professional Information</h5>

                    <div className="mb-3">
                      <label className="form-label">Skills</label>
                      <input
                        type="text"
                        className="form-control"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                      <small className="form-text text-muted">
                        Separate skills with commas
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Experience</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Brief description of your work experience"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Education</label>
                      <input
                        type="text"
                        className="form-control"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g., BS Computer Science - RMIT"
                      />
                    </div>
                  </>
                )}

                {/* Recruiter-specific fields */}
                {selectedRole === "RECRUITER" && (
                  <>
                    <hr className="my-4" />
                    <h5 className="mb-3">Company Information</h5>

                    <div className="mb-3">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        placeholder="Your company name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Company Info</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={companyInfo}
                        onChange={(e) => setCompanyInfo(e.target.value)}
                        placeholder="Brief description of your company"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
