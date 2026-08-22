import apiClient from './client';
import type {
  ApiResponse,
  Quote,
  QuoteCorridor,
  CreateQuotePayload,
  UpdateQuotePayload,
  AttachCorridorsPayload,
  UpdateQuoteCorridorPayload,
  RemoveCorridorsPayload,
} from '../types';

export class QuoteService {
  static async create(payload: CreateQuotePayload): Promise<ApiResponse<Quote>> {
    const response = await apiClient.post<ApiResponse<Quote>>('/quotes', payload);
    return response.data;
  }

  static async getAll(params?: Record<string, unknown>): Promise<ApiResponse<Quote[]>> {
    const response = await apiClient.get<ApiResponse<Quote[]>>('/quotes', { params });
    return response.data;
  }

  static async getById(id: number | string): Promise<ApiResponse<Quote>> {
    const response = await apiClient.get<ApiResponse<Quote>>(`/quotes/${id}`);
    return response.data;
  }

  static async update(id: number | string, payload: UpdateQuotePayload): Promise<ApiResponse<Quote>> {
    const response = await apiClient.patch<ApiResponse<Quote>>(`/quotes/${id}`, payload);
    return response.data;
  }

  static async delete(id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/quotes/${id}`);
    return response.data;
  }

  static async listCorridors(id: number | string): Promise<ApiResponse<QuoteCorridor[]>> {
    const response = await apiClient.get<ApiResponse<QuoteCorridor[]>>(`/quotes/${id}/corridors`);
    return response.data;
  }

  static async attachCorridors(
    id: number | string,
    payload: AttachCorridorsPayload
  ): Promise<ApiResponse<QuoteCorridor[]>> {
    const response = await apiClient.post<ApiResponse<QuoteCorridor[]>>(`/quotes/${id}/corridors`, payload);
    return response.data;
  }

  static async updateCorridor(
    id: number | string,
    corridorId: number | string,
    payload: UpdateQuoteCorridorPayload
  ): Promise<ApiResponse<QuoteCorridor>> {
    const response = await apiClient.patch<ApiResponse<QuoteCorridor>>(
      `/quotes/${id}/corridors/${corridorId}`,
      payload
    );
    return response.data;
  }

  static async removeCorridors(
    id: number | string,
    payload: RemoveCorridorsPayload
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/quotes/${id}/corridors`, {
      data: payload,
    });
    return response.data;
  }
}

