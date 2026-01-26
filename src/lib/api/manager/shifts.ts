import { STORAGE_KEYS } from '@/lib/constants/storage';
import { ApiErrorResponse, getErrorCode } from '../types';

export interface Shift {
  id: number;
  name: string;
  startTime: string; // Format: HH:mm:ss
  endTime: string;   // Format: HH:mm:ss
  isActive: boolean;
}

export interface GetShiftsResponse {
  traceId: string;
  data: {
    shifts: Shift[];
  };
}

export interface EmployeeShiftAssignment {
  userId: number;
  userName: string;
  fullName: string;
  assignDate: string;
  shiftId: number | null;
}

export interface GetEmployeesForShiftAssignmentResponse {
  traceId: string;
  data: {
    employees: EmployeeShiftAssignment[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

/**
 * Get list of all shifts for manager
 */
export const getManagerShifts = async (): Promise<GetShiftsResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_MANAGER_SHIFTS!,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Referer: window.location.origin,
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
    throw new Error(getErrorCode(error, 'Failed to fetch shifts'));
  }

  return response.json();
};

/**
 * Get list of employees for shift assignment on a specific date
 */
export const getEmployeesForShiftAssignment = async (params: {
  assignDate: string;
  page?: number;
  size?: number;
}): Promise<GetEmployeesForShiftAssignmentResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const queryParams = new URLSearchParams({
    assignDate: params.assignDate,
    page: (params.page || 0).toString(),
    size: (params.size || 20).toString(),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_MANAGER_SHIFTS}/employees?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Referer: window.location.origin,
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
    throw new Error(getErrorCode(error, 'Failed to fetch employees for shift assignment'));
  }

  return response.json();
};

export interface BulkShiftAssignment {
  userId: number;
  shiftId: number;
}

export interface BulkAssignShiftsRequest {
  assignDate: string;
  assignments: BulkShiftAssignment[];
}

export interface BulkAssignShiftsResponse {
  traceId: string;
  data: {
    success: boolean;
  };
}

/**
 * Bulk assign shifts to employees for a specific date
 */
export const bulkAssignShifts = async (
  request: BulkAssignShiftsRequest
): Promise<BulkAssignShiftsResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_MANAGER_SHIFTS}/employees/assign`,
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
    throw new Error(getErrorCode(error, 'Failed to assign shifts'));
  }

  return response.json();
};