import {STORAGE_KEYS} from '@/lib/constants/storage';

// Types
export interface Role {
  id: number;
  name: string;
}

export interface GetRolesResponse {
  traceId: string;
  data: Role[];
}

/**
 * Fetch list of roles from admin API
 * @returns Promise with roles list
 */
export const getRoles = async (): Promise<GetRolesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
      process.env.NEXT_PUBLIC_API_ADMIN_ROLES!,
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
    const error = await response.json();
    throw new Error(error.errorCodes?.[0] || 'Failed to fetch roles');
  }

  return response.json();
};
