import { toast } from 'sonner';

interface ErrorDetails {
  [key: string]: string | string[] | undefined;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: ErrorDetails | string[] | string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorObject {
  message?: string;
  code?: string;
  details?: ErrorDetails | string[] | string;
}

interface ApiErrorResponse {
  [key: string]: unknown;
  message?: string;
  error?: string | ErrorObject;
  data?: Record<string, unknown>;
  statusCode?: number;
}

interface ApiError extends Error {
  response?: {
    status?: number;
    data?: unknown;
  };
  skipDefaultHandler?: boolean;
  message: string;
}

const getErrorMessageFromResponse = (errorData: ApiErrorResponse): string | null => {
  // Case 1: Direct message
  if (errorData.message && typeof errorData.message === 'string') return errorData.message;

  // Case 2: Error object with message
  if (errorData.error) {
    if (typeof errorData.error === 'string') return errorData.error;
    const errObj = errorData.error as ErrorObject;
    if (errObj.message) return errObj.message;
  }

  // Case 3: Check for common error message fields
  const possibleMessageFields = ['error_message', 'errorMessage', 'err', 'msg'];
  for (const field of possibleMessageFields) {
    const value = errorData[field];
    if (typeof value === 'string') return value;
  }

  return null;
};

export const handleApiError = (error: unknown, options: { skipToast?: boolean } = {}): never => {
  console.error('[handleApiError] Raw error:', error);

  // Type guard for ApiError
  const isApiError = (err: unknown): err is ApiError => {
    return typeof err === 'object' && err !== null && 'skipDefaultHandler' in (err as ApiError);
  };

  // Type guard for Error-like objects
  const isError = (err: unknown): err is Error => {
    return (
      err instanceof Error ||
      (typeof err === 'object' && err !== null && 'message' in (err as Error))
    );
  };

  // Skip default handling if requested
  if (isApiError(error) && error.skipDefaultHandler) {
    throw error;
  }

  // If error is already an AppError, just rethrow it
  if (error instanceof AppError) {
    if (!options.skipToast) {
      toast.error(error.message);
    }
    throw error;
  }

  // Handle network errors
  if (
    isError(error) &&
    (error.message === 'Network Error' || (isApiError(error) && !error.response)) &&
    !options.skipToast
  ) {
    const message = 'Unable to connect to the server. Please check your internet connection.';
    toast.error(message);
    throw new AppError(message, 'NETWORK_ERROR');
  }

  // Handle API errors with response
  if (isApiError(error) && error.response) {
    const status = error.response.status || 500; // Default to 500 if status is undefined
    const responseData = (error.response.data || {}) as ApiErrorResponse;
    const errorData: ApiErrorResponse = {
      ...responseData,
      [Symbol.iterator]: function* () {
        yield* Object.entries(this);
      }
    };

    const errorMessage = getErrorMessageFromResponse(errorData) || 'An unknown error occurred';

    // Handle specific HTTP status codes
    if (status === 401) {
      const message = 'Your session has expired. Please log in again.';
      if (!options.skipToast) toast.error(message);
      throw new AppError(message, 'UNAUTHORIZED');
    }

    if (status === 403) {
      const message = 'You do not have permission to perform this action';
      if (!options.skipToast) toast.error(message);
      throw new AppError(message, 'FORBIDDEN');
    }

    if (status === 404) {
      const message = 'The requested resource was not found';
      if (!options.skipToast) toast.error(message);
      throw new AppError(message, 'NOT_FOUND');
    }

    if (status >= 500) {
      const message = 'An unexpected server error occurred. Please try again later.';
      if (!options.skipToast) toast.error(message);
      throw new AppError(message, 'SERVER_ERROR');
    }

    // For all other API errors
    if (!options.skipToast) {
      toast.error(errorMessage);
    }
    throw new AppError(errorMessage, `API_ERROR_${status}`);
  }

  // Handle unknown error types
  const message = isError(error) ? error.message : 'An unknown error occurred';

  if (!options.skipToast) {
    toast.error(message);
  }
  throw new AppError(message, 'UNKNOWN_ERROR');
};

export const showErrorToast = (error: unknown) => {
  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }
  if (error instanceof Error) {
    toast.error(error.message);
  } else if (typeof error === 'string') {
    toast.error(error);
  } else {
    toast.error('An unexpected error occurred');
  }
};
