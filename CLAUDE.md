# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solpyra Attendance is a Next.js 15 attendance/check-in application with role-based access control (Admin, Manager, User). It deploys to Cloudflare Workers via OpenNext.js.

## Build & Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build with Turbopack
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run deploy       # Deploy to Cloudflare Workers
```

## Architecture

### App Router Structure
- `/` - Login page (public)
- `/admin/*` - Admin dashboard (employees, facilities, attendances)
- `/manager/*` - Manager dashboard (users, map-based check-in)
- `/user/*` - Employee view (own attendance)
- `/auth/qr/*` - MFA QR code generation and verification

### Key Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components organized by feature (auth, admin, qr, notification)
- `src/lib/api/` - API client functions (auth.ts, admin/*, manager/*)
- `src/lib/constants/` - Storage keys and error messages

### Authentication Flow
1. Login with email/password → returns OTP token
2. Either generate new QR code (first time) or verify existing OTP
3. User scans QR with authenticator app, enters OTP
4. Success returns accessToken, refreshToken, roles → stored in localStorage

### State Management
- `LoadingContext` - App-wide loading state via `useLoading()`
- `NotificationProvider` - Toast notifications via `useNotify()`
- Tokens stored in localStorage using keys from `STORAGE_KEYS`

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

Use `ErrorMessage.getMessage(error.message, 'fallback')` for user-facing errors.

## Tech Stack

- **Next.js 15.5.9** with App Router and Turbopack
- **React 19** with TypeScript 5.9
- **MUI 7** with Toolpad for dashboard layouts
- **Biome** for linting/formatting (not ESLint)
- **Leaflet** for maps, **html5-qrcode** for QR scanning, **react-qr-code** for QR generation
- **Cloudflare Workers** deployment via OpenNext.js

## Code Conventions

- Use `'use client'` directive for client components
- Type all API responses with interfaces
- Use MUI's `sx` prop for component styling
- Wrap role-specific routes with their layout files
- Use `notifySuccess()`, `notifyError()` from `useNotify()` for user feedback

## Environment Variables

API endpoints are configured in `.env` with `NEXT_PUBLIC_` prefix. Base URL points to backend at `localhost:8080` in development.