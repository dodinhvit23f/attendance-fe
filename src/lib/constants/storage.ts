/**
 * LocalStorage key constants
 * Centralized storage keys to maintain consistency across the application
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ROLES: 'roles',
  OTP_TOKEN: 'OTP_TOKEN',
  TENANT: 'tenant',
  TIER: 'tier',
  TIER_DATA: 'tierData',
  AFFILIATE_LINK_CLICKED: 'affiliateLinkClicked',
} as const;
