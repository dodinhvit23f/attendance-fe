'use client';

import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Navigation, NotificationsProvider } from '@toolpad/core';
import { usePathname, useRouter } from 'next/navigation';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { theme } from '@/theme';

// Navigation configuration for manager
const NAVIGATION: Navigation = [
  {
    segment: 'manager/users',
    title: 'Nhân Viên',
    icon: <PeopleIcon />,
  },
  {
    segment: 'manager/attendances',
    title: 'Chấm Công',
    icon: <AssignmentIcon />,
  },
  {
    segment: 'logout',
    title: 'Đăng Xuất',
    icon: <LogoutIcon />,
  }
];

export default function ManagerLayout({
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
      if (pathString === '/logout' || pathString === '/manager/logout') {
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
        title: 'Quản Lý',
        logo: <AssignmentIcon />,
        homeUrl: '/manager',
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