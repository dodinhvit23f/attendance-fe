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

const MAX_ATTEMPTS = 5;
const OTP_TTL_SECONDS = 180;

export default function QRVerifyPage() {
  const theme = useTheme();
  const {notifySuccess, notifyError} = useNotify();
  const router = useRouter()
  const {withLoading} = useLoading()

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [isLocked, setIsLocked] = React.useState(false);
  const [secondsRemaining, setSecondsRemaining] = React.useState(OTP_TTL_SECONDS);
  const [attemptError, setAttemptError] = React.useState('');

  useEffect(() => {
    if (secondsRemaining <= 0 || isLocked) return;
    const id = setInterval(() => setSecondsRemaining(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsRemaining, isLocked]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerColor = secondsRemaining > 60
    ? theme.palette.success.main
    : secondsRemaining > 30
      ? theme.palette.warning.main
      : theme.palette.error.main;

  const lockAndRedirect = (message: string) => {
    setIsLocked(true);
    localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);
    notifyError(message);
    router.push('/');
  };

  const handleConfirm = async (code: string) => {
    if (isSubmitting || isLocked || secondsRemaining === 0) return;
    setIsSubmitting(true);
    setAttemptError('');
    try {
      await withLoading('otp-verify', async () => {
        const response = await otpLoginApi(code);

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(response.data.roles));
        localStorage.setItem(STORAGE_KEYS.TIER, response.data.tier);
        localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);

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
      });
    } catch (error) {
      if (error instanceof Error) {
        const code = error.message;

        if (code === 'OTP_NOT_CORRECT' || code === 'ERROR_AUTH_015') {
          const next = failedAttempts + 1;
          setFailedAttempts(next);
          if (next >= MAX_ATTEMPTS) {
            lockAndRedirect('Quá nhiều lần thử. Vui lòng đăng nhập lại.');
          } else {
            setAttemptError(`Mã không đúng. Còn ${MAX_ATTEMPTS - next} lần thử.`);
          }
          return;
        }

        if (code === 'OTP_RATE_LIMIT_EXCEEDED' || code === 'ERROR_AUTH_027') {
          lockAndRedirect('Quá nhiều lần thử. Vui lòng đăng nhập lại.');
          return;
        }

        if (code === 'INVALID_TOKEN' || code === 'ERROR_AUTH_011') {
          router.push('/');
          localStorage.removeItem(STORAGE_KEYS.OTP_TOKEN);
          notifyError('Phiên đăng nhập hết hạn');
          return;
        }
      }

      notifyError('Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const otpToken = localStorage.getItem(STORAGE_KEYS.OTP_TOKEN);
    if (!otpToken || otpToken.trim() === '') {
      router.push('/');
    }
  }, [router]);

  const isExpired = secondsRemaining === 0;
  const inputDisabled = isLocked || isExpired;

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

              {/* Timer */}
              <Stack alignItems="center">
                {isExpired ? (
                    <Typography
                        variant="body2"
                        sx={{color: theme.palette.error.main, fontWeight: 500, textAlign: 'center'}}
                    >
                      Mã đã hết hạn. Vui lòng đăng nhập lại.
                    </Typography>
                ) : (
                    <Typography
                        variant="body2"
                        sx={{color: timerColor, fontWeight: 600, fontSize: '16px', fontVariantNumeric: 'tabular-nums'}}
                    >
                      {formatTime(secondsRemaining)}
                    </Typography>
                )}
              </Stack>

              {/* Code Verification Component */}
              <CodeVerification
                  onConfirm={handleConfirm}
                  codeLength={6}
                  loading={isSubmitting}
                  disabled={inputDisabled}
                  externalError={attemptError}
              />
            </Stack>
          </Paper>
        </Box>
      </Container>
  );
}
