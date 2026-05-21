import { STORAGE_KEYS } from './constants/storage';

export const QR_CODE_TTL_MS = 3 * 60 * 1000;

interface QrCacheEntry {
  data: string;
  expiresAt: number;
  otpToken: string;
}

export const saveQrCode = (data: string, otpToken: string): number => {
  const expiresAt = Date.now() + QR_CODE_TTL_MS;
  const entry: QrCacheEntry = { data, expiresAt, otpToken };
  localStorage.setItem(STORAGE_KEYS.QR_CODE, JSON.stringify(entry));
  return expiresAt;
};

export const getQrCode = (
  otpToken: string,
): { data: string; expiresAt: number } | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.QR_CODE);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as QrCacheEntry;
    if (Date.now() >= entry.expiresAt || entry.otpToken !== otpToken) {
      localStorage.removeItem(STORAGE_KEYS.QR_CODE);
      return null;
    }
    return { data: entry.data, expiresAt: entry.expiresAt };
  } catch {
    localStorage.removeItem(STORAGE_KEYS.QR_CODE);
    return null;
  }
};

export const clearQrCode = (): void => {
  localStorage.removeItem(STORAGE_KEYS.QR_CODE);
};
