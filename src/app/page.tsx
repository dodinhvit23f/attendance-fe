'use client';

import React from 'react';
import {Box, Container, Stack, Typography, useTheme} from '@mui/material';
import {DividerWithText, FooterLinks, LoginCard, LoginForm,} from '@/components/auth';

export default function Home() {
  const theme = useTheme();

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
          maxWidth: '400px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <LoginCard>
          <Stack spacing={1} alignItems="center">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                textAlign: 'center',
              }}
            >
              Chào mừng trở lại
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
              }}
            >
              Đăng nhập để tiếp tục
            </Typography>
          </Stack>
          <LoginForm />
          <DividerWithText />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <FooterLinks />
          </Box>

        </LoginCard>
      </Box>

    </Container>
  );
}
