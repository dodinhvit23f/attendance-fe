import { STORAGE_KEYS } from '@/lib/constants/storage';
import { ApiErrorResponse, getErrorCode } from '../types';

// Facility Types
export interface Facility {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowDistance: number;
  active: boolean;
}

export interface FacilityLight {
  id: number;
  name: string;
}

export interface CreateFacilityRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowDistance: number;
}

export interface CreateFacilityResponse {
  traceId: string;
  data: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    allowDistance: number;
  };
}

export interface UpdateFacilityRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowDistance: number;
}

export interface UpdateFacilityResponse {
  traceId: string;
  data: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    allowDistance: number;
  };
}

export interface GetFacilitiesParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetFacilitiesResponse {
  traceId: string;
  data: Facility[];
}

export interface GetFacilitiesLightResponse {
  traceId: string;
  data: FacilityLight[];
}

export interface ToggleFacilityStatusRequest {
  active: boolean;
}

export interface ToggleFacilityStatusResponse {
  traceId: string;
  data: boolean;
}

/**
 * Create a new facility
 * @param facility - Facility data to create
 * @returns Promise with created facility data
 */
export const createFacility = async (
  facility: CreateFacilityRequest
): Promise<CreateFacilityResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_ADMIN_FACILITIES!,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(facility),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to create facility'));
  }

  return response.json();
};

/**
 * Update an existing facility
 * @param id - Facility ID to update
 * @param facility - Updated facility data
 * @returns Promise with updated facility data
 */
export const updateFacility = async (
  id: number,
  facility: UpdateFacilityRequest
): Promise<UpdateFacilityResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_FACILITIES}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(facility),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to update facility'));
  }

  return response.json();
};

/**
 * Fetch list of facilities
 * @param params - Pagination parameters
 * @returns Promise with facilities list
 */
export const getFacilities = async (
  params: GetFacilitiesParams
): Promise<GetFacilitiesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const queryParams = new URLSearchParams({
  page: (params.page ?? 0).toString(),
    size: (params.size ?? 10).toString(),
    sort: params.sort ?? 'id,desc',
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_FACILITIES}?${queryParams}`,
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
    throw new Error(getErrorCode(error, 'Failed to fetch facilities'));
  }

  return response.json();
};

/**
 * Toggle facility active status
 * @param id - Facility ID
 * @param active - New active status
 * @returns Promise with response
 */
export const toggleFacilityStatus = async (
  id: number,
  active: boolean
): Promise<ToggleFacilityStatusResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_FACILITIES}/${id}/status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ active: String(active) }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    const errorCode = getErrorCode(error, 'Failed to update facility status');
    if (error.errorCodes?.[0] === 'ERROR_024') {
      throw new Error('Không tìm thấy cơ sở');
    }
    throw new Error(errorCode);
  }

  return response.json();
};

/**
 * Fetch light list of facilities (id and name only)
 * @returns Promise with facilities light list
 */
export const getFacilitiesLight = async (): Promise<GetFacilitiesLightResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_ADMIN_FACILITIES_LIGHT!,
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
    throw new Error(getErrorCode(error, 'Failed to fetch facilities'));
  }

  return response.json();
};
