import { HttpErrorResponse } from '@angular/common/http';

/** Normalized failure shape so feature code never depends on HttpErrorResponse. */
export interface ApiError {
  status: number;
  message: string;
  cause?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    const detail =
      typeof error.error === 'object' && error.error !== null
        ? (error.error as { detail?: unknown }).detail
        : undefined;

    return {
      status: error.status,
      message:
        typeof detail === 'string'
          ? detail
          : error.message || 'The request failed. Please try again.',
      cause: error,
    };
  }

  return {
    status: 0,
    message: 'An unexpected error occurred. Please try again.',
    cause: error,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    typeof (value as ApiError).message === 'string'
  );
}
