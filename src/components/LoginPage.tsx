// src/components/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      // AuthContext will handle storing token and user data
      // Navigate to jobs page after successful login
      navigate("/jobs");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  function validateInputs() {
    const errors = { email: "", password: "" };

    if (email.trim() === "") {
      errors.email = "Email is required";
    } else if (!email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    if (password.length === 0) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setValidationErrors(errors);
    return !errors.email && !errors.password;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">
                💼 Job Platform Login
              </h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${
                      validationErrors.email ? "is-invalid" : ""
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setValidationErrors({ ...validationErrors, email: "" });
                    }}
                    placeholder="Enter your email"
                    required
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback">
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        validationErrors.password ? "is-invalid" : ""
                      }`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationErrors({
                          ...validationErrors,
                          password: "",
                        });
                      }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Logging in...
                    </>
                  ) : (
                    "🔐 Login"
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-decoration-none">
                      Register here
                    </Link>
                  </p>
                </div>
              </form>

              {/* Test account hint */}
              <div className="alert alert-info mt-3 small">
                <strong>💡 Test Accounts:</strong>
                <br />
                <small>
                  Candidate: candidate@test.com / Candidate123!
                  <br />
                  Recruiter: recruiter@test.com / Recruiter123!
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
