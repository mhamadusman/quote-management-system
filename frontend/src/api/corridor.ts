import apiClient from './client';
import type { ApiResponse, Corridor } from '../types';

export class CorridorService {
  static async getAll(): Promise<ApiResponse<{ corridors: Corridor[] } | Corridor[]>> {
    const response = await apiClient.get<ApiResponse<{ corridors: Corridor[] } | Corridor[]>>('/corridors');
    return response.data;
  }
}
