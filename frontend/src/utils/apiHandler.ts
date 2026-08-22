import axios from 'axios';
import { toast } from 'react-toastify';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ApiErrorResponse } from '../types';

export const handleApiSuccess = (message?: string) => {
  if (message) {
    toast.success(message);
  }
};

export const handleApiError = <T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
  defaultFallbackMessage: string = 'An unexpected error occurred. Please try again.'
) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const errorData = error.response?.data;

    if (errorData) {
      let hasFieldErrors = false;
      if (Array.isArray(errorData.errors) && setError && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          if (err.field && err.message) {
            setError(err.field as Path<T>, {
              type: 'server',
              message: err.message,
            });
            hasFieldErrors = true;
          }
        });
      }

      const toastMessage = errorData.message || defaultFallbackMessage;

      if (!hasFieldErrors || errorData.message) {
        toast.error(toastMessage);
      }
      return;
    }
  }

  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error(defaultFallbackMessage);
  }
};
