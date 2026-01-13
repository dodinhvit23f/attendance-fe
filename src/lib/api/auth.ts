import { STORAGE_KEYS } from '@/lib/constants/storage';
import { ApiErrorResponse, getErrorCode } from './types';

interface RefreshTokenResponse {
  traceId: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const verifyTokenApi = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken) {
    return false;
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_VERIFY_TOKEN!, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.ok;
};

export const refreshTokenApi = async (): Promise<RefreshTokenResponse> => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    const error = new Error('Refresh token not found');
    (error as any).status = 401;
    throw error;
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_REFRESH_TOKEN!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error('Token refresh failed');
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROLES);
  localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);
};

interface LoginRequest {
  username: string;
  password: string;
  tenant: string;
}

interface LoginResponse {
  traceId: string;
  data: {
    haveMFA: boolean;
    otpToken: string;
    requiredGenerateOTP: boolean;
  };
}

interface OtpLoginRequest {
  otp: string;
  tenant: string;
}

interface OtpLoginResponse {
  traceId: string;
  data: {
    accessToken: string;
    refreshToken: string;
    roles: string[];
    haveMFA: boolean;
    requiredGenerateOTP: boolean;
  };
}

interface OtpGenerateRequest {
  tenant: string;
}

interface OtpGenerateResponse {
  traceId: string;
  data: string; // QR code URL
}

interface OtpVerifyRequest {
  otp: string;
  tenant: string;
}

interface OtpVerifyResponse {
  traceId: string;
  data: boolean;
}

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_LOGIN!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email,
      password: password,
      tenant: 'attendance',
    } as LoginRequest),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error));
  }

  return response.json();
};

export const otpLoginApi = async (otp: string): Promise<OtpLoginResponse> => {
  const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

  if (!otpToken) {
    throw new Error('OTP token not found. Please login first.');
  }
  const response = await fetch(process.env.NEXT_PUBLIC_API_LOGIN_WITH_OTP!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': otpToken,
    },
    body: JSON.stringify({
      otp,
      tenant: 'attendance',
    } as OtpLoginRequest),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'OTP verification failed'));
  }

  return response.json();
};

export const otpGenerateApi = async (): Promise<OtpGenerateResponse> => {
  const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

  if (!otpToken) {
    throw new Error('OTP token not found. Please login first.');
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_OTP_GENERATE!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': otpToken,
    },
    body: JSON.stringify({
      tenant: 'attendance',
    } as OtpGenerateRequest),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'OTP generation failed'));
  }

  return response.json();
};

export const otpVerifyApi = async (otp: string): Promise<OtpVerifyResponse> => {
  const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

  if (!otpToken) {
    throw new Error('OTP token not found. Please login first.');
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_OTP_VERIFY!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': otpToken,
    },
    body: JSON.stringify({
      otp,
      tenant: 'attendance',
    } as OtpVerifyRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      const unauthorizedError = new Error('Unauthorized');
      (unauthorizedError as any).status = 401;
      throw unauthorizedError;
    }
    const error: ApiErrorResponse = await response.json();
    throw new Error(getErrorCode(error, 'OTP verification failed'));
  }

  return response.json();
};
