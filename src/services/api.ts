// src/services/api.ts
// File imports TypeScript types
// Crucial for strong type checking, ensuring that data sent to and receieved from the API matches the exprected structure
import type {
  User,
  LoginCredentials,
  RegisterData,
  JobPosting,
  CreateJobData,
  UpdateJobData,
  Application,
  CreateApplicationData,
  ApplicationStatus,
  JobSearchParams,
  CandidateSearchParams,
  ApiResponse,
  PaginatedResponse,
} from "../types";

// Constant determines the base URL for all API calls
// Uses import.meta.env, means the url is configured via a Vite environment variable (e.g, in a .env file)
// Then falls back to "localhost:5001/api" if the variable is not set
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ===== HELPER FUNCTIONS =====
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  // Data extraction (Specific Backend Format)
  // Handle your backend's response format: { status: 'success', data: {...} }
  if (data.status === "success" && data.data) {
    return data.data;
  }

  return data;
};

// ===== AUTHENTICATION =====
export const authAPI = {
  register: async (
    registerData: RegisterData
  ): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });
  return handleResponse(response);
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        ...getAuthHeader(),
      }),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ===== JOB API =====
export const jobAPI = {
  // Get all jobs with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<JobPosting>> => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await fetch(`${API_URL}/jobs?${queryString}`);
    return handleResponse(response);
  },

// Search jobs
  search: async (
    params: JobSearchParams
  ): Promise<PaginatedResponse<JobPosting>> => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await fetch(`${API_URL}/jobs/search?${queryString}`);
    return handleResponse(response);
  },

  // Get single job by ID
  getById: async (id: number): Promise<JobPosting> => {
    const response = await fetch(`${API_URL}/jobs/${id}`);
    return handleResponse(response);
  },

  // Create new job (recruiter only)
  create: async (data: CreateJobData): Promise<JobPosting> => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update job (recruiter only)
  update: async (id: number, data: UpdateJobData): Promise<JobPosting> => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete job (recruiter only)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Get my jobs (recruiter only)
  getMyJobs: async (): Promise<JobPosting[]> => {
    const response = await fetch(`${API_URL}/jobs/my-jobs`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ===== APPLICATION API =====
export const applicationAPI = {
  // Apply for a job (candidate only)
  apply: async (data: CreateApplicationData): Promise<Application> => {
    const response = await fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get my applications (candidate only)
  getMyApplications: async (): Promise<Application[]> => {
    const response = await fetch(`${API_URL}/applications/my-applications`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Get applications for a job (recruiter only)
  getForJob: async (jobId: number): Promise<Application[]> => {
    const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Update application status (recruiter only)
  updateStatus: async (
    id: number,
    status: ApplicationStatus
  ): Promise<Application> => {
    const response = await fetch(`${API_URL}/applications/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Withdraw application (candidate only)
  withdraw: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/applications/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ===== USER API =====
export const userAPI = {
  // Search candidates (recruiter/admin only)
  searchCandidates: async (
    params: CandidateSearchParams
  ): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await fetch(
      `${API_URL}/users/search-candidates?${queryString}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};

