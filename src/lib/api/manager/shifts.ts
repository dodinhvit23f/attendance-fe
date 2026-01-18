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