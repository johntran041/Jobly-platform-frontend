// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, LoginCredentials, RegisterData } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Parse stored user
          const userData = JSON.parse(storedUser);

          // Optionally verify token is still valid by fetching profile
          // For now, just trust localStorage
          setUser({ ...userData, token });
        } catch (error) {
          console.error("Failed to restore session:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      const userData = { ...response.user, token: response.token };

      // Save to state
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log(
        "✅ Login successful:",
        userData.email,
        "Role:",
        userData.role
      );
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      const userData = { ...response.user, token: response.token };

      // Save to state
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log(
        "✅ Registration successful:",
        userData.email,
        "Role:",
        userData.role
      );
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out...");

    // Clear state
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data);
      // response is { user: User }
      const userData = { ...response.user, token: user?.token };

      // Update state
      setUser(userData);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("✅ Profile updated");
    } catch (error) {
      console.error("❌ Profile update failed:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isCandidate: user?.role === "CANDIDATE",
    isRecruiter: user?.role === "RECRUITER",
    isAdmin: user?.role === "ADMIN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
