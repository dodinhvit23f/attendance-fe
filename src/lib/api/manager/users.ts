import { STORAGE_KEYS } from '@/lib/constants/storage';

// Types
export interface ManagerEmployee {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  role: string;
  active: boolean;
  version: number;
}

export interface GetManagerUsersParams {
  facilityIds?: number[];
}

export interface GetManagerUsersResponse {
  traceId: string;
  data: {
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    employees: ManagerEmployee[];
  };
}

/**
 * Fetch list of users for manager
 * @param params - Filter parameters (optional facility IDs)
 * @returns Promise with users list
 */
export const getManagerUsers = async (
  params?: GetManagerUsersParams
): Promise<GetManagerUsersResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const queryParams = new URLSearchParams();

  // Add facility IDs if provided
  if (params?.facilityIds && params.facilityIds.length > 0) {
    queryParams.append('facilityIds', params.facilityIds.join(','));
  }

  const url = queryParams.toString()
    ? `${process.env.NEXT_PUBLIC_API_MANAGER_USERS}?${queryParams}`
    : process.env.NEXT_PUBLIC_API_MANAGER_USERS!;

  const response = await fetch(url, {
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
    const error = await response.json();
    throw new Error(error.errorCodes?.[0] || 'Failed to fetch users');
  }

  return response.json();
};