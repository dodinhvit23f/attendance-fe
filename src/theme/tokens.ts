/**
 * Design Tokens for Solpyra Attendance
 * Centralized design values for consistent styling
 */

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
} as const;

export const spacing = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
} as const;

export const shadows = {
  card: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  dialog: '0px 8px 16px rgba(0, 0, 0, 0.1)',
  button: '0px 2px 8px rgba(0, 0, 0, 0.08)',
} as const;

export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
} as const;
