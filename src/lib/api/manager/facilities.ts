import {STORAGE_KEYS} from "@/lib/constants";
import { ApiErrorResponse, getErrorCode } from '../types';

export interface ManagerFacility {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowDistance: number;
  active: boolean;
}

export interface GetManagerFacilitiesResponse {
  traceId: string;
  data: ManagerFacility[];
}

/**
 * Fetch list of facilities for manager
 * @returns Promise with facilities list
 */
export const getManagerFacilities = async (): Promise<GetManagerFacilitiesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
      process.env.NEXT_PUBLIC_API_MANAGER_FACILITIES!,
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
    throw new Error(getErrorCode(error, 'Failed to fetch facilities'));
  }

  return response.json();
};