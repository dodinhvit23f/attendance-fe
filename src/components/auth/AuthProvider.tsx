'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { verifyTokenApi, refreshTokenApi, clearAuthStorage } from '@/lib/api/auth';
import { STORAGE_KEYS } from '@/lib/constants/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  checkAuth: async () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

const PUBLIC_PATHS = ['/', "/auth"];

const getUserRoles = (): string[] => {
  const rolesStr = localStorage.getItem(STORAGE_KEYS.ROLES);
  if (!rolesStr) return [];

  try {
    return JSON.parse(rolesStr);
  } catch {
    return [];
  }
};

const getRedirectPathByRole = (): string => {
  const roles = getUserRoles();

  if (roles.includes('ADMIN')) {
    return '/admin';
  }
  if (roles.includes('MANAGER')) {
    return '/manager';
  }
  return '/user';
};

const hasRoleForPath = (pathname: string): boolean => {
  const roles = getUserRoles();

  if (pathname.startsWith('/admin')) {
    return roles.includes('ADMIN');
  }
  if (pathname.startsWith('/manager')) {
    return roles.includes('MANAGER');
  }
  // /user route - any authenticated user can access
  return true;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    // No token, not authenticated
    if (!accessToken) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      // Step 1: Verify current token
      const isValid = await verifyTokenApi();

      if (isValid) {
        setIsAuthenticated(true);
        return true;
      }

      // Step 2: Token invalid, try to refresh
      const refreshResponse = await refreshTokenApi();

      // Save new tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, refreshResponse.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshResponse.data.refreshToken);

      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      // Step 3: Refresh failed, clear storage and redirect to login
      console.error('Auth check failed:', error);
      clearAuthStorage();
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {


      const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith("/auth"));

      if (isPublicPath) {
        // Check if user has valid token on public path, redirect based on role
        if (localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
          const isValid = await checkAuth();

          if (isValid) {
            const redirectPath = getRedirectPathByRole();
            router.replace(redirectPath);
            return
          }
        }
        setIsAuthenticated(false);
        return;
      }

      // Protected routes - check authentication
      const isValid = await checkAuth();

      if (!isValid) {
        router.replace('/');
        setIsAuthenticated(false);
        return;
      }

      // Check role-based access
      if (!hasRoleForPath(pathname)) {
        // User doesn't have required role, redirect to their allowed route
        const redirectPath = getRedirectPathByRole();
        router.replace(redirectPath);
        setIsAuthenticated(false);
      }


    };

    initAuth();
  }, [pathname, checkAuth, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}