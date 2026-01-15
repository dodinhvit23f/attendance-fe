'use client';

import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Navigation, NotificationsProvider } from '@toolpad/core';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { theme } from '@/components/root/client-layout';

// Navigation configuration for user
const NAVIGATION: Navigation = [
  {
    segment: 'user',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'user/attendances',
    title: 'Chấm Công',
    icon: <AssignmentIcon />,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'logout',
    title: 'Đăng Xuất',
    icon: <LogoutIcon />,
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle navigation
  const handleNavigation = React.useCallback(
    (path: string | URL) => {
      const pathString = path.toString();
      if (pathString === '/logout' || pathString === '/user/logout') {
        // Redirect to logout page
        router.push('/logout');
      } else {
        router.push(pathString);
      }
    },
    [router]
  );

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        title: 'Người Dùng',
        logo: <DashboardIcon />,
        homeUrl: '/user',
      }}
      theme={theme}
      router={{
        pathname: `/${pathname}`,
        searchParams: new URLSearchParams(),
        navigate: handleNavigation,
      }}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </DashboardLayout>
    </AppProvider>
  );
}
