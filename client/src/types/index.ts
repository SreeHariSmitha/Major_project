// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  pagination: null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Auth Types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse extends User {
  // No password field in response
}
