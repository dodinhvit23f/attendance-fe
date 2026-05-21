'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {STORAGE_KEYS} from "@/lib/constants";
import {useLoading} from "@/components/root/client-layout";

export default function LogoutPage() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TIER);
    localStorage.removeItem(STORAGE_KEYS.TIER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TENANT);

    showLoading('logout');
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);

    return () => {
      clearTimeout(timer);
      hideLoading();
    };
  }, [router, showLoading, hideLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
      }}
    >
      <LogoutIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Đang đăng xuất...
      </Typography>
      <CircularProgress />
    </Box>
  );
}
