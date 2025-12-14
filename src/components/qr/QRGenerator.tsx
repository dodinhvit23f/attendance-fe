'use client';

import React, {useState} from 'react';
import {Box, Button, Stack, Typography, useTheme} from '@mui/material';
import {CheckCircle, Download} from '@mui/icons-material';

interface QRGeneratorProps {
  onConfirm?: (qrImageUrl: string) => void;
  apiEndpoint?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  onConfirm,
  apiEndpoint = '/api/qr/generate' // Default API endpoint
}) => {
  const theme = useTheme();
  const [qrImageUrl, setQrImageUrl] = useState<string>('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleConfirm = () => {
    if (onConfirm && qrImageUrl) {
      onConfirm(qrImageUrl);
    }
  };

  const handleDownload = async () => {
    if (!qrImageUrl) return;

    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <Stack spacing={3}>
      {/* QR Code Display */}
      {qrImageUrl && !loading && (
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
              <img
                src={qrImageUrl}
                alt="QR Code"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
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
            Quét mã QR này để điểm danh
          </Typography>

          <Stack direction="row" spacing={2} width="100%">
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{
                borderRadius: '24px',
                borderWidth: '2px',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(109, 76, 65, 0.05)',
                },
              }}
            >
              Tải xuống
            </Button>

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
        </Stack>
      )}
    </Stack>
  );
};
