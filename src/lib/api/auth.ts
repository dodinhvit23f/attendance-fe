import { STORAGE_KEYS } from '@/lib/constants/storage';

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
    const error = await response.json()

    throw new Error(error.errorCodes[0]);
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
    const error = await response.json();
    const errorCode =  error.errorCodes?.[0]
    errorCode
    if(errorCode){
      throw new Error(error.errorCodes?.[0] || 'OTP verification failed');
    }

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
    const error = await response.json();
    throw new Error(error.errorCodes?.[0] || 'OTP generation failed');
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
    const error = await response.json();
    throw new Error(error.errorCodes?.[0] || 'OTP verification failed');
  }

  return response.json();
};
