'use client';

import React, {useState} from 'react';
import {Box, Button, Stack, TextField, Typography, useTheme} from '@mui/material';
import {CheckCircle} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import {otpVerifyApi} from '@/lib/api/auth';
import {useRouter} from 'next/navigation';

interface QRGeneratorProps {
  qrData?: string; // OTP auth URL or any data to encode
  setLoading?: (loading: boolean) => void;
  notifySuccess?: (message: string) => void;
  notifyError?: (message: string) => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  qrData,
  setLoading,
  notifySuccess,
  notifyError
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [otp, setOtp] = useState('');

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleConfirm = async () => {
    if (otp.length !== 6) {
      notifyError?.('Vui lòng nhập đầy đủ số OTP');
      return;
    }

    try {
      setLoading?.(true);
      await otpVerifyApi(otp);
      notifySuccess?.('Xác thực OTP thành công');
      router.push('/');
    } catch (error) {
      if (error instanceof Error && (error as any).status === 401) {
        router.push('/');
        return;
      }
      if (error instanceof Error) {
        notifyError?.('Mã OTP không chính xác. Vui lòng thử lại.');
      }
    } finally {
      setLoading?.(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* QR Code Display */}
      {qrData && (
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #D0D0D0',
              display: 'inline-flex',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box
              sx={{
                width: 250,
                height: 250,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCode
                value={qrData}
                size={250}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '13px',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            Quét mã QR này với ứng dụng xác thực (Google Authenticator, Authy...)
          </Typography>

          <TextField
            label="Mã OTP"
            placeholder="Nhập Số OTP"
            type="text"
            fullWidth
            variant="outlined"
            value={otp}
            onChange={handleOtpChange}
            slotProps={{
              htmlInput: {
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '12px 16px',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '0.5em',
                fontWeight: 600,
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<CheckCircle />}
            onClick={handleConfirm}
            sx={{
              borderRadius: '24px',
              padding: '12px 24px',
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0px 4px 12px rgba(109, 76, 65, 0.2)',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 6px 16px rgba(109, 76, 65, 0.3)',
              },
            }}
          >
            Xác nhận
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
