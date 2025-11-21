// src/types/index.ts

// ===== USER & AUTH TYPES =====
export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  username: string;
  role: Role;

  // Common fields
  fullName?: string;
  phone?: string;

  // Candidate-specific
  skills?: string;
  experience?: string;
  education?: string;
  resume?: string;

  // Recruiter-specific
  companyName?: string;
  companyInfo?: string;

  // Auth
  token?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Login Information
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration Information - User Signup
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role: Role;
  fullName?: string;
  phone?: string;

  // Candidate fields
  skills?: string;
  experience?: string;
  education?: string;

  // Recruiter fields
  companyName?: string;
  companyInfo?: string;
}

// ===== JOB POSTING TYPES =====
export interface JobPosting {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary?: string;
  location: string;
  industry: string;
  jobType: string; // e.g., "FULL_TIME", "PART_TIME", "CONTRACT"
  recruiterId: number;

  // Relations
  recruiter?: {
    id: number;
    companyName: string;
    email: string;
  };

  // Metadata
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements: string;
  salary?: string;
  location: string;
  industry: string;
  jobType: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
  isActive?: boolean;
}

// ===== APPLICATION TYPES =====
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export interface Application {
  id: number;
  jobPostingId: number;
  candidateId: number;
  status: ApplicationStatus;
  coverLetter?: string;

  // Relations
  jobPosting?: JobPosting;
  candidate?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    skills?: string;
    experience?: string;
    education?: string;
    resume?: string;
  };

  // Metadata
  appliedAt: string;
  updatedAt: string;
}

export interface CreateApplicationData {
  jobPostingId: number;
  coverLetter?: string;
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
}

// ===== SEARCH & FILTER TYPES =====
export interface JobSearchParams {
  keyword?: string;
  location?: string;
  industry?: string;
  jobType?: string;
  minSalary?: string;
  maxSalary?: string;
  page?: number;
  limit?: number;
}

export interface CandidateSearchParams {
  keyword?: string;
  skills?: string;
  experience?: string;
  location?: string;
  page?: number;
  limit?: number;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  status: string;
  results: number;
  data: {
    jobs: T[]; // Backend returns "jobs" not "items"
    total: number;
    skip: number;
    limit: number;
  };
}

// ===== FORM VALIDATION TYPES =====
export interface ValidationErrors {
  [key: string]: string;
}
