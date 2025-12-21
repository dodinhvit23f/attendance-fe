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
