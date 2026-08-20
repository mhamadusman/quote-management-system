export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiErrorItem[];
}
