'use client';

import React, {useEffect} from 'react';
import { Container, Box, Stack, Typography, useTheme, Paper } from '@mui/material';
import { CodeVerification } from '@/components/qr/CodeVerification';
import { FooterLinks } from '@/components/auth';
import {useLoading} from "@/components/root/client-layout";
import {useNotify} from "@/components/notification/NotificationProvider";
import {useRouter} from "next/navigation";

export default function QRVerifyPage() {
  const theme = useTheme();
  const {setLoading} = useLoading()
  const {notifySuccess, notifyError} = useNotify();
  const router = useRouter()

  const handleConfirm = (code: string) => {
    console.log('Verification code confirmed:', code);
    // TODO: Add API call to verify code
    // Example:
    // const response = await fetch('/api/qr/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code }),
    // });
  };

  useEffect(() => {
    setLoading(false)
  }, [setLoading]);

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
                Xác Thực Mã QR
              </Typography>
            </Stack>

            {/* Code Verification Component */}
            <CodeVerification onConfirm={handleConfirm} codeLength={6} />
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
