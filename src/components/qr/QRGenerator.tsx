'use client';

import React from 'react';
import {Box, Button, Stack, Typography, useTheme} from '@mui/material';
import {CheckCircle} from '@mui/icons-material';
import QRCode from 'react-qr-code';

interface QRGeneratorProps {
  onConfirm?: (qrData: string) => void;
  qrData?: string; // OTP auth URL or any data to encode
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  onConfirm,
  qrData
}) => {
  const theme = useTheme();

  const handleConfirm = () => {
    if (onConfirm && qrData) {
      onConfirm(qrData);
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
