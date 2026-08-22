import apiClient from './client';
import type { ApiResponse, User, SignupPayload, LoginPayload } from '../types';

export class AuthService {
  static async signup(payload: SignupPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/signup', payload);
    return response.data;
  }

  static async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/login', payload);
    return response.data;
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/account/profile');
    return response.data;
  }

  static async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/account/logout');
    return response.data;
  }
}

