# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solpyra Attendance is a Next.js 15 attendance/check-in application with role-based access control (Admin, Manager, User). It deploys to Cloudflare Workers via OpenNext.js. Error messages and UI text are in Vietnamese.

## Claude Model Roles

- **Opus** - Planning, reasoning, architecture design
- **Sonnet** - Execution, refactoring, implementation

## Build & Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build with Turbopack
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run preview      # OpenNextJS Cloudflare local preview
npm run deploy       # Deploy to Cloudflare Workers
```

## Architecture

### App Router Structure
- `/` - Login page (public); optional `?platform=<tenant>` query param, defaults to "vincharm"
- `/logout` - Clears localStorage and redirects to login
- `/auth/qr/generator` - OTP QR code generation (first-time 2FA setup)
- `/auth/qr/verify` - OTP code entry and verification
- `/admin` - Admin dashboard with stat cards
- `/admin/employees` - Employee CRUD with pagination
- `/admin/facilities` - Facility management
- `/admin/attendances` - View and manage attendance records
- `/manager` - Manager dashboard
- `/manager/users` - Employee management for manager
- `/manager/attendances` - Attendance management with shift assignment
- `/user` - User dashboard (requests camera + location permissions)
- `/user/attendances` - User check-in via QR scan or facility selection

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/auth/` - Auth context, login form, loading screen
- `src/components/admin/` - Employee/facility/shift/map dialogs
- `src/components/manager/` - Bulk shift assignment dialog
- `src/components/qr/` - QR generator, inline scanner, code verification
- `src/components/ui/` - Shared UI primitives (PageHeader, StandardDialog, ActionButton, etc.)
- `src/components/notification/` - Queue-based snackbar NotificationProvider
- `src/components/root/` - Client layout wrapper and Emotion cache registry
- `src/lib/api/` - API client functions (`auth.ts`, `admin/*`, `manager/*`, `user/*`, `types.ts`)
- `src/lib/constants/` - `storage.ts` (STORAGE_KEYS), `errorMessages.ts` (ErrorMessage class)
- `src/theme/` - MUI theme (primary: brown #6D4C41, secondary: warm gray #D7CCC8)

### Authentication Flow
1. User enters email/password on `/` → `loginApi()` → returns `{ haveMFA, otpToken, requiredGenerateOTP }`
2. OTP_TOKEN stored in localStorage
3. If `requiredGenerateOTP=true`: redirect to `/auth/qr/generator`, scan QR with authenticator app, enter code → `otpVerifyApi()`
4. Redirect to `/auth/qr/verify` → user enters 6-digit TOTP code → `otpLoginApi()`
5. Success: stores ACCESS_TOKEN, REFRESH_TOKEN, ROLES in localStorage; clears OTP_TOKEN
6. Role-based redirect: ADMIN → `/admin`, MANAGER → `/manager`, others → `/user`
7. AuthProvider validates token on every protected page load; auto-refreshes on 401

### State Management
- `AuthProvider` (`components/auth/AuthProvider.tsx`) - Token validation, refresh, and role-based routing
- `LoadingContext` - App-wide loading state via `useLoading()` (in `components/root/client-layout.tsx`)
- `NotificationProvider` - Queue-based snackbar notifications via `useNotify()`
- Tokens stored in localStorage using keys from `STORAGE_KEYS` (`src/lib/constants/storage.ts`)

### API Pattern
All API functions follow this pattern:
```typescript
const response = await fetch(process.env.NEXT_PUBLIC_API_*!, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
});
// Response format: { traceId, data, errorCodes }
```

**OTP endpoints** use a different header — no "Bearer" prefix:
```typescript
Authorization: `${otpToken}`  // not "Bearer ..."
```

Use `getErrorCode(error, 'fallback')` from `src/lib/api/types.ts` to extract error codes, then `ErrorMessage.getMessage(code, 'fallback')` for Vietnamese user-facing messages.

### Key Utility Functions (`src/lib/api/types.ts`)
- `getErrorCode(error, fallback)` - Extract error code from API error response
- `formatDateWithTimezone(date)` - Format date with timezone offset for API requests
- `parseDateTime(dateTime)` - Parse `DD-MM-YYYYTHH:mm:ssZ` format strings using dayjs
- `parseDate(date)` - Parse `YYYY-MM-DDZ` format date strings

### Location-Based Check-in (user/manager)
- Uses browser Geolocation API for coordinates
- Haversine formula calculates distance to facility center
- Check-in only allowed within facility's `allowDistance` radius
- QR code contains JSON-encoded facility data; user scans QR or selects facility manually

### Pagination Convention
- Default page size: 10–30 items
- Sort: `id,desc` (newest first)
- Offset-based with `totalElements` tracking

## Tech Stack

- **Next.js 15.5.9** with App Router and Turbopack
- **React 19.1** with TypeScript 5.9
- **MUI 7** + **@toolpad/core 0.16** for dashboard layouts
- **@mui/x-date-pickers 8** + **dayjs** for date handling
- **Biome 2.2** for linting/formatting (not ESLint/Prettier)
- **Leaflet 1.9** + **react-leaflet 5** for maps
- **html5-qrcode 2.3** for QR scanning, **react-qr-code 2** for QR generation
- **Cloudflare Workers** deployment via OpenNext.js

## Code Conventions

- Use `'use client'` directive for all client components
- Type all API responses with interfaces
- Use MUI's `sx` prop for component styling
- Wrap role-specific routes with their layout files
- Use `notifySuccess()`, `notifyError()` from `useNotify()` for user feedback
- Path alias `@/*` maps to `./src/*`

### Code Cleanliness
- **Remove unused imports** - Delete imports that are never referenced in the file
- **Remove unused exports** - Delete exported constants, functions, or types that are never imported elsewhere
- **Remove empty style objects** - Delete empty `sx={{}}` props or empty CSS-in-JS objects that serve no purpose
- **Delete dead code** - Remove commented-out code blocks, unreachable code paths, or obsolete functions
- Run `npm run build` after cleanup to verify no breakage

## Environment Variables

All API endpoints are in `.env` with `NEXT_PUBLIC_` prefix. Base URL: `https://authentication.solpyra.com`.

Key groups:
- `NEXT_PUBLIC_API_LOGIN`, `NEXT_PUBLIC_API_LOGIN_WITH_OTP`, `NEXT_PUBLIC_API_OTP_*`, `NEXT_PUBLIC_API_VERIFY_TOKEN`, `NEXT_PUBLIC_API_REFRESH_TOKEN`
- `NEXT_PUBLIC_API_ADMIN_EMPLOYEES`, `NEXT_PUBLIC_API_ADMIN_FACILITIES`, `NEXT_PUBLIC_API_ADMIN_FACILITIES_LIGHT`, `NEXT_PUBLIC_API_ADMIN_ROLES`, `NEXT_PUBLIC_API_ADMIN_ATTENDANCE`, `NEXT_PUBLIC_API_ADMIN_SHIFTS`
- `NEXT_PUBLIC_API_MANAGER_USERS`, `NEXT_PUBLIC_API_MANAGER_FACILITIES`, `NEXT_PUBLIC_API_MANAGER_ATTENDANCE_RECORD`, `NEXT_PUBLIC_API_MANAGER_ATTENDANCES`, `NEXT_PUBLIC_API_MANAGER_SHIFTS`
- `NEXT_PUBLIC_API_USER_FACILITIES`, `NEXT_PUBLIC_API_USER_ATTENDANCES`, `NEXT_PUBLIC_API_USER_ATTENDANCE_RECORD`
