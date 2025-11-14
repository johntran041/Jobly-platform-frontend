// src/components/LoginPage.tsx
import { useState } from "react";

interface ValidateUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  refreshToken?: string;
}

interface LoginPageProps {
  onLogin: (user: ValidateUser) => void;
}

function sanitizeString(str: string): string {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function validateUserResponse(data: any): ValidateUser | null {
  if (!data || typeof data !== "object") {
    console.error("❌ Invalid response: data is missing or not an object");
    return null;
  }

  const requiredFields = ["id", "username", "email"];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`❌ Invalid response: missing required field '${field}'`);
      return null;
    }
  }

  if (typeof data.id !== "number") {
    console.error("❌ Invalid response: id must be a number");
    return null;
  }

  if (typeof data.username !== "string" || data.username.trim() === "") {
    console.error("❌ Invalid response: username must be a non-empty string");
    return null;
  }

  if (typeof data.email !== "string" || !data.email.includes("@")) {
    console.error("❌ Invalid response: invalid email format");
    return null;
  }

  const sanitizedUser: ValidateUser = {
    id: data.id,
    username: sanitizeString(String(data.username).trim()),
    email: sanitizeString(String(data.email).trim().toLowerCase()),
    firstName: sanitizeString(String(data.username).trim()), // Use username as firstName
    lastName: "",
    gender: "unknown",
    image: "",
    token: data.token ? String(data.token).trim() : undefined,
    refreshToken: undefined,
  };

  console.log("✅ User validation passed:", sanitizedUser);
  return sanitizedUser;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
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
    setShowHint(false);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Your backend returns: { status: 'success', data: { token, user } }
        const userData = {
          ...data.data.user,
          token: data.data.token,
        };

        const validatedUser = validateUserResponse(userData);
        if (validatedUser) {
          onLogin(validatedUser);
          console.log("Login Successful!", validatedUser);
        } else {
          setError("⚠️ Received invalid data from server. Please try again.");
          setShowHint(true);
          console.error("❌ Response validation failed:", data);
        }
      } else {
        setError(data.message || "❌ Invalid credentials");
        setShowHint(true);
      }
    } catch (error) {
      setError("Network error. Make sure the backend is running on port 5001.");
      setShowHint(true);
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
    <div className="container mt-10 w-100">
      <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>

          {error && (
            <div className="alert alert-danger small" role="alert">
              {error}
            </div>
          )}

          {showHint && (
            <div className="alert alert-info mt-3 small">
              <strong>💡 Having trouble logging in?</strong>
              <ul className="mb-0 mt-2">
                <li>
                  Make sure you're using your <strong>email address</strong>
                </li>
                <li>Email should be lowercase (e.g., 'user@test.com')</li>
                <li>Password must be at least 8 characters</li>
                <li>Check for typos in your password</li>
              </ul>
              <hr />
              <small className="text-muted">
                <strong>Test Accounts:</strong>
                <br />
                Email: user@test.com | Password: User123!
                <br />
                Email: admin@test.com | Password: Admin123!
              </small>
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
                <div className="invalid-feedback d-block small">
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
                    setValidationErrors({ ...validationErrors, password: "" });
                  }}
                  placeholder="Try: User123!"
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
                <div className="invalid-feedback d-block small">
                  {validationErrors.password}
                </div>
              )}
              <div className="text-end mt-1">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={() => alert("Password reset feature coming soon!")}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
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
          </form>
        </div>
      </div>
    </div>
  );
}
