'use client';

import React from 'react';
import {Container, Box, Stack, Typography, useTheme, createTheme} from '@mui/material';
import {
  LoginCard,
  LoginForm,
  DividerWithText,
  SocialLoginButton,
  FooterLinks,
} from '@/components/auth';

export const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#6D4C41',
      dark: '#4E342E',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#D7CCC8',
      contrastText: '#3E2723',
    },

    background: {
      default: '#FFFFFF',
      paper: '#FAF7F5',
    },

    text: {
      primary: '#3E2723',
      secondary: '#6D4C41',
    },

    divider: '#E0D7D3',

    error: {
      main: '#C62828',
    },
  },

  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,

    h1: {
      fontWeight: 700,
      color: '#3E2723',
    },
    h2: {
      fontWeight: 600,
      color: '#3E2723',
    },
  },
})

export default function Home() {
  const theme = useTheme();

  const handleLogin = (data: { email: string; password: string }) => {
    console.log('Login submitted:', data);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
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
        background: 'background: linear-gradient( 135deg, #EFEFEF 0%, #E2E2E2 30%, #D3D3D3 55%, #E2E2E2 80%, #F1F1F1 100% )',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          //background: 'radial-gradient(circle at 20% 50%, rgba(109, 76, 65, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(215, 204, 200, 0.15) 0%, transparent 50%)',
          filter: 'blur(60px)',
          zIndex: 0,
        },
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
          <LoginForm onSubmit={handleLogin} />
          <DividerWithText />
          <SocialLoginButton provider="google" onClick={handleGoogleLogin} />
        </LoginCard>
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <FooterLinks />
      </Box>
    </Container>
  );
}
