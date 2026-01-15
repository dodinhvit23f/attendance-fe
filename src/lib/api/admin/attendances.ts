import { STORAGE_KEYS } from '@/lib/constants/storage';
import { ApiErrorResponse, formatDateWithTimezone, getErrorCode } from '../types';

export interface Attendance {
  id: number;
  employeeId: string;
  fullName: string;
  checkInDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  duration: string | null;
}

export interface GetAttendancesParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
  userNames?: string; // Comma-separated usernames
}

export interface GetAttendancesResponse {
  traceId: string;
  data: Attendance[];
}

/**
 * Get attendances with filters
 */
export const getAttendances = async (params: GetAttendancesParams): Promise<GetAttendancesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('startDate', formatDateWithTimezone(params.startDate));
  queryParams.append('endDate', formatDateWithTimezone(params.endDate));
  if (params.userNames) {
    queryParams.append('userNames', params.userNames);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_ATTENDANCE}?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to fetch attendances'));
  }

  return response.json();
};
