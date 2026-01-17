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

export interface GetShiftResponse {
  traceId: string;
  data: Shift;
}

export interface CreateShiftRequest {
  name: string;
  startTime: string; // Format: HH:mm:ss
  endTime: string;   // Format: HH:mm:ss
}

export interface CreateShiftResponse {
  traceId: string;
  data: Shift;
}

export interface UpdateShiftRequest {
  name: string;
  startTime: string; // Format: HH:mm:ss
  endTime: string;   // Format: HH:mm:ss
}

export interface UpdateShiftResponse {
  traceId: string;
  data: Shift;
}

export interface UpdateShiftStatusResponse {
  traceId: string;
  data: Shift;
}

/**
 * Get list of all shifts
 */
export const getShifts = async (): Promise<GetShiftsResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_ADMIN_SHIFTS!,
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
    throw new Error(getErrorCode(error, 'Failed to fetch shifts'));
  }

  return response.json();
};

/**
 * Get a single shift by ID
 */
export const getShift = async (id: number): Promise<GetShiftResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_SHIFTS}/${id}`,
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
    throw new Error(getErrorCode(error, 'Failed to fetch shift'));
  }

  return response.json();
};

/**
 * Create a new shift
 */
export const createShift = async (
  shiftData: CreateShiftRequest
): Promise<CreateShiftResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_ADMIN_SHIFTS!,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(shiftData),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to create shift'));
  }

  return response.json();
};

/**
 * Update an existing shift
 */
export const updateShift = async (
  id: number,
  shiftData: UpdateShiftRequest
): Promise<UpdateShiftResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_SHIFTS}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(shiftData),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to update shift'));
  }

  return response.json();
};

/**
 * Toggle shift active status
 */
export const updateShiftStatus = async (
  id: number,
  isActive: boolean
): Promise<UpdateShiftStatusResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_SHIFTS}/${id}/change-status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isActive }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to update shift status'));
  }

  return response.json();
};