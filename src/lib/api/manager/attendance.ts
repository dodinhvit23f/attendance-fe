import { STORAGE_KEYS } from '@/lib/constants';
import { ApiErrorResponse, getErrorCode } from '../types';

export interface RecordAttendanceRequest {
  latitude: number;
  longitude: number;
  facilityId: number;
}

export interface RecordAttendanceResponse {
  traceId: string;
  data: {
    id: number;
    employeeId: number;
    facilityId: number;
    checkInTime: string;
    latitude: number;
    longitude: number;
  };
}

export const recordAttendance = async (
  request: RecordAttendanceRequest
): Promise<RecordAttendanceResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_MANAGER_ATTENDANCE_RECORD!,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Referer: window.location.origin,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to record attendance'));
  }

  return response.json();
};
