'use client';

import * as React from 'react';
import {AppProvider} from '@toolpad/core/AppProvider';
import {DashboardLayout} from '@toolpad/core/DashboardLayout';
import {Navigation, NotificationsProvider} from '@toolpad/core';
import {usePathname, useRouter} from 'next/navigation';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import {theme} from "@/components/root/client-layout";

// Navigation configuration
const NAVIGATION: Navigation = [
  {
    segment: 'admin/employees',
    title: 'Nhân Viên',
    icon: <PeopleIcon/>,
  },
  {
    segment: 'admin/facilities',
    title: 'Cơ Sở',
    icon: <BusinessIcon/>,
  },
  {
    segment: 'admin/attendances',
    title: 'Chấm Công',
    icon: <AssignmentIcon/>,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'logout',
    title: 'Đăng Xuất',
    icon: <LogoutIcon/>,
  },
];

export default function AdminLayout({
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
        if (pathString === '/logout' || pathString === '/admin/logout') {
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
            title: 'Quản Trị Viên',
            logo: <AssignmentIcon/>,
            homeUrl: '/admin',
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
