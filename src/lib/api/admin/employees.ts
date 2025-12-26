import { STORAGE_KEYS } from '@/lib/constants/storage';

// Types
export interface Employee {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: string;
  active: boolean;
}

export interface GetEmployeesParams {
  page: number;
  size: number;
  tenant: string;
}

export interface GetEmployeesResponse {
  traceId: string;
  data: {
    employees: Employee[];
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

/**
 * Fetch paginated list of employees from admin API
 * @param params - Pagination and filtering parameters
 * @returns Promise with employee list and pagination metadata
 */
export const getEmployees = async (
  params: GetEmployeesParams
): Promise<GetEmployeesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    tenant: params.tenant,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES}?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
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
    const error = await response.json();
    throw new Error(error.errorCodes?.[0] || 'Failed to fetch employees');
  }

  return response.json();
};
