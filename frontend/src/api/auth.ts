import apiClient from './client';
import type { ApiResponse } from './client';

export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {
  static async signup(payload: SignupPayload): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/auth/signup', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/auth/login', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/account/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/account/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
