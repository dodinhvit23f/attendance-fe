'use client';

import React from 'react';
import { Container, Box, Stack, Typography, useTheme, Paper } from '@mui/material';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { FooterLinks } from '@/components/auth';

export default function QRGeneratorPage() {
  const theme = useTheme();

  const handleConfirm = (qrValue: string) => {
    console.log('QR Code confirmed:', qrValue);
    // TODO: Add navigation or API call logic here
  };

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
        background: 'linear-gradient(151deg, #ffffff 0%, #fff5f5 30%, #fdfdfd 55%, #ebebeb 80%, #F1F1F1 100%)',
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
