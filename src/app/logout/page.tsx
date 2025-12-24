'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear();

    // Delay 1 second then redirect to login page
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

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
