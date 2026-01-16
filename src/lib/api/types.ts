import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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

/**
 * Formats a date string with the browser's timezone offset
 * @param date - Date string in YYYY-MM-DD format
 * @returns Date string with timezone offset (e.g., "2026-11-23T00:00:00+08:00")
 */
export const formatDateWithTimezone = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ');
};

/**
 * Parses a datetime string in DD-MM-YYYYTHH:mm:ss format with timezone
 * @param dateTime - DateTime string (e.g., "15-01-2026T16:09:48+07:00")
 * @returns dayjs object
 */
export const parseDateTime = (dateTime: string): dayjs.Dayjs => {
  return dayjs(dateTime, 'DD-MM-YYYYTHH:mm:ssZ');
};

/**
 * Parses a date string with timezone offset
 * @param date - Date string (e.g., "2026-01-15+07:00")
 * @returns dayjs object
 */
export const parseDate = (date: string): dayjs.Dayjs => {
  return dayjs(date, 'YYYY-MM-DDZ');
};
