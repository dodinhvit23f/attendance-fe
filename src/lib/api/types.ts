/**
 * Common API error response interface
 * Used to type-check error responses from the backend API
 */
export interface ApiErrorResponse {
  errorCodes: string[];
  traceId?: string;
  message?: string;
}

/**
 * Helper function to extract the first error code from an API error response
 * @param error - The parsed error response
 * @param fallbackMessage - Optional fallback message if no error code is found
 * @returns The first error code or the fallback message
 */
export const getErrorCode = (
  error: ApiErrorResponse,
  fallbackMessage?: string
): string => {
  return error.errorCodes?.[0] || fallbackMessage || 'An error occurred';
};
