'use client';

import React, { useEffect } from 'react';
import { Container, Box, Stack, Typography, useTheme, Paper } from '@mui/material';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { FooterLinks } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/root/client-layout';
import { STORAGE_KEYS } from '@/lib/constants/storage';

export default function QRGeneratorPage() {
  const theme = useTheme();
  const router = useRouter();
  const { setLoading } = useLoading();

  const handleConfirm = (qrValue: string) => {
    console.log('QR Code confirmed:', qrValue);
    // TODO: Add navigation or API call logic here
  };

  useEffect(() => {
    // Check if OTP_TOKEN exists
    const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

    if (!otpToken || otpToken.trim() === '') {
      // Redirect to home if OTP_TOKEN doesn't exist or is empty
      router.push('/');
      return;
    }

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [router, setLoading]);

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        py: 3,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: '24px',
            padding: { xs: '24px', sm: '32px', md: '48px' },
            width: '100%',
            backgroundColor: 'rgba(250, 247, 245, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px 0 rgba(109, 76, 65, 0.15)',
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Stack spacing={1} alignItems="center">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                }}
              >
                Mã QR Đăng Nhập
              </Typography>

            </Stack>

            {/* QR Generator Component */}
            <QRGenerator/>
          </Stack>
        </Paper>
      </Box>

      {/*<Box sx={{ position: 'relative', zIndex: 1 }}>
        <FooterLinks />
      </Box>*/}
    </Container>
  );
}
