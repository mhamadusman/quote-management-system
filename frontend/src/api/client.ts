import axios from 'axios';

export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData: ApiErrorResponse = error.response?.data || {
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(errorData);
  }
);

export default apiClient;
