"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { LoadingScreen } from "@/components/auth/LoadingScreen/loading-screen";

const SAFETY_TIMEOUT_MS = 30_000;

type LoadingApi = {
  isLoading: boolean;
  showLoading: (key?: string) => void;
  hideLoading: (key?: string) => void;
  withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingApi | null>(null);

export function useLoading(): LoadingApi {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used inside <LoadingProvider>");
  }
  return ctx;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const lastKeyRef = useRef<string | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const clearSafetyTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const armSafetyTimeout = useCallback(() => {
    clearSafetyTimeout();
    timeoutRef.current = setTimeout(() => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[LoadingProvider] safety reset after ${SAFETY_TIMEOUT_MS}ms; last key=`,
          lastKeyRef.current,
        );
      }
      timeoutRef.current = null;
      setCount(0);
    }, SAFETY_TIMEOUT_MS);
  }, [clearSafetyTimeout]);

  const showLoading = useCallback(
    (key?: string) => {
      lastKeyRef.current = key;
      setCount((c) => {
        if (c === 0) armSafetyTimeout();
        return c + 1;
      });
    },
    [armSafetyTimeout],
  );

  const hideLoading = useCallback(() => {
    setCount((c) => {
      const next = Math.max(0, c - 1);
      if (next === 0) clearSafetyTimeout();
      return next;
    });
  }, [clearSafetyTimeout]);

  const withLoading = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
      showLoading(key);
      try {
        return await fn();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading],
  );

  const setLoading = useCallback(
    (value: boolean) => {
      if (value) showLoading("legacy");
      else hideLoading();
    },
    [showLoading, hideLoading],
  );

  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      clearSafetyTimeout();
      setCount(0);
    }
  }, [pathname, clearSafetyTimeout]);

  useEffect(() => () => clearSafetyTimeout(), [clearSafetyTimeout]);

  const isLoading = count > 0;

  return (
    <LoadingContext.Provider
      value={{ isLoading, showLoading, hideLoading, withLoading, setLoading }}
    >
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  );
}
