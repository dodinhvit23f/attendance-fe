'use client';

import React, {useEffect} from 'react';
import {Box, Container, Paper, Stack, Typography, useTheme} from '@mui/material';
import {CodeVerification} from '@/components/qr/CodeVerification';
import {useLoading} from "@/components/root/client-layout";
import {useNotify} from "@/components/notification/NotificationProvider";
import {useRouter} from "next/navigation";
import {otpLoginApi} from '@/lib/api/auth';
import {STORAGE_KEYS} from '@/lib/constants/storage';
import {fetchTiersApi, storeTierData} from '@/lib/api/subscription';

export default function QRVerifyPage() {
  const theme = useTheme();
  const {notifySuccess, notifyError} = useNotify();
  const router = useRouter()
  const {setLoading} = useLoading()

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async (code: string) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setLoading(true);

      const response = await otpLoginApi(code);

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(response.data.roles));
      localStorage.setItem(STORAGE_KEYS.TIER, response.data.tier);
      localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN)

      try {
        const tiers = await fetchTiersApi(response.data.accessToken);
        storeTierData(tiers);
      } catch {
        // tier data is supplemental — do not block login on failure
      }

      notifySuccess('Xác thực thành công!');

      if (response.data.roles.includes('ADMIN')) {
        router.push('/admin');
      } else if (response.data.roles.includes('MANAGER')) {
        router.push('/manager');
      } else {
        router.push('/user');
      }
    } catch (error) {
      if(error instanceof Error){
        if (error.message == "ERROR_AUTH_011") {
          router.push('/');
          localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN)
          notifyError('Phiên đăng nhập hết hạn');
          return
        }
      }

      notifyError('Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);

    if (!otpToken || otpToken.trim() === '') {
      router.push('/');
      return;
    }

    setLoading(false);
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
                padding: {xs: '24px', sm: '32px', md: '48px'},
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
              <CodeVerification onConfirm={handleConfirm} codeLength={6} loading={isSubmitting}/>
            </Stack>
          </Paper>
        </Box>
      </Container>
  );
}
