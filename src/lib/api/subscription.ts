import { STORAGE_KEYS } from '@/lib/constants/storage';

export interface TierLimit {
  tier: string;
  maxUsers: number;
  maxFacilities: number;
  maxAttendanceMonths: number;
}

interface TierDataWithTTL {
  tiers: TierLimit[];
  expiresAt: number;
}

const TTL_MS = 86_400_000; // 1 day

export const fetchTiersApi = async (accessToken: string): Promise<TierLimit[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_SUBSCRIPTION_TIERS!, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch tiers');

  const json = await response.json() as { data: { tiers: TierLimit[] } };
  return json.data.tiers;
};

export const storeTierData = (tiers: TierLimit[]): void => {
  const payload: TierDataWithTTL = { tiers, expiresAt: Date.now() + TTL_MS };
  localStorage.setItem(STORAGE_KEYS.TIER_DATA, JSON.stringify(payload));
};

export const getStoredTierData = (): TierLimit[] | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.TIER_DATA);
  if (!raw) return null;
  try {
    const parsed: TierDataWithTTL = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEYS.TIER_DATA);
      return null;
    }
    return parsed.tiers;
  } catch {
    return null;
  }
};
