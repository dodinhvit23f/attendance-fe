import {STORAGE_KEYS} from '@/lib/constants/storage';
import { ApiErrorResponse, getErrorCode } from '../types';

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
  version: number;
  phoneNumber: string
  address: string;
  shiftId: number;
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

export interface CreateEmployeeRequest {
  userName: string;
  password: string;
  role: string;
  facilityIds: number[];
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface CreateEmployeeResponse {
  traceId: string;
  data: Employee;
}

export interface UpdateEmployeeStatusRequest {
  active: string;
  version: number;
}

export interface UpdateEmployeeStatusResponse {
  traceId: string;
  data: boolean;
}

export interface UpdateEmployeeRequest {
  role: string;
  facilityIds: number[];
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  password?: string;
}

export interface UpdateEmployeeResponse {
  traceId: string;
  data: Employee;
}

export interface EmployeeDetail {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  active: boolean;
  version: number;
  role: string;
  facilities: {
    id: number;
    name: string;
  }[];
  shiftId: number;
}

export interface GetEmployeeResponse {
  traceId: string;
  data: EmployeeDetail;
}

export interface ActiveEmployee {
  id: number;
  userName: string;
}

export interface GetActiveEmployeesResponse {
  traceId: string;
  data: {
    users: ActiveEmployee[];
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
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to fetch employees'));
  }

  return response.json();
};

/**
 * Fetch a single employee by ID
 * @param id - Employee ID
 * @returns Promise with employee details
 */
export const getEmployee = async (
    id: string
): Promise<GetEmployeeResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES}/${id}`,
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
    throw new Error(getErrorCode(error, 'Failed to fetch employee'));
  }

  return response.json();
};

/**
 * Create a new employee
 * @param employeeData - Employee data to create
 * @returns Promise with created employee data
 */
export const createEmployee = async (
    employeeData: CreateEmployeeRequest
): Promise<CreateEmployeeResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
      process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES!,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(employeeData),
      }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to create employee'));
  }

  return response.json();
};

/**
 * Update employee status
 * @param id - Employee ID
 * @param active - New active status as string
 * @param version - Employee version for optimistic locking
 * @returns Promise with response
 */
export const updateEmployeeStatus = async (
    id: number,
    active: boolean,
    version: number
): Promise<UpdateEmployeeStatusResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  let v = 0
  if (version) {
    v = version
  }

  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES}/${id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          active: String(active),
          version: v,
        }),
      }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to update employee status'));
  }

  return response.json();
};

/**
 * Update an existing employee
 * @param id - Employee ID
 * @param employeeData - Employee data to update
 * @returns Promise with updated employee data
 */
export const updateEmployee = async (
    id: number,
    employeeData: UpdateEmployeeRequest
): Promise<UpdateEmployeeResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES}/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(employeeData),
      }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized. Please login again.');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'Failed to update employee'));
  }

  return response.json();
};

/**
 * Get list of active employees (username and fullName only)
 * @returns Promise with active employees list
 */
export const getActiveEmployees = async (): Promise<GetActiveEmployeesResponse> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    throw new Error('Access token not found. Please login first.');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADMIN_EMPLOYEES}/active`,
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
    throw new Error(getErrorCode(error, 'Failed to fetch active employees'));
  }

  return response.json();
};
