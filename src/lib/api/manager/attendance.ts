import { STORAGE_KEYS } from '@/lib/constants';
import { ApiErrorResponse, formatDateWithTimezone, getErrorCode } from '../types';

export interface Attendance {
  id: number;
  userName: string;
  fullName: string;
  checkInDate: string;
  checkIn: string;
  checkOut?: string;
  shiftId?: number;
  insertedBy?: string | null;
  updatedBy?: string | null;
}

export interface GetAttendancesResponse {
  traceId: string;
  data: {
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    attendances: Attendance[];
  };
}

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

export interface GetManagerAttendancesParams {
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const getManagerAttendances = async (
  params: GetManagerAttendancesParams
): Promise<GetAttendancesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const url = new URL(process.env.NEXT_PUBLIC_API_MANAGER_ATTENDANCES!);
  url.searchParams.append('startDate', formatDateWithTimezone(params.startDate));
  url.searchParams.append('endDate', formatDateWithTimezone(params.endDate));
  url.searchParams.append('page', (params.page ?? 0).toString());
  url.searchParams.append('size', (params.size ?? 10).toString());
  url.searchParams.append('sort', params.sort ?? 'id,desc');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Referer: window.location.origin,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to get attendances'));
  }

  return response.json();
};

export const assignShiftToManagerAttendance = async (
  attendanceId: number,
  shiftId: number
): Promise<{ traceId: string; data: Attendance }> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_MANAGER_ATTENDANCES}/${attendanceId}/shift`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Referer: window.location.origin,
      },
      body: JSON.stringify({ shiftId }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to assign shift'));
  }

  return response.json();
};
