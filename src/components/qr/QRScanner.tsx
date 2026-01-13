'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Html5Qrcode } from 'html5-qrcode';
import { useNotify } from '@/components/notification/NotificationProvider';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  open,
  onClose,
  onScan,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyError } = useNotify();

  const startScanner = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );

      setIsScannerReady(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      let errorMessage = 'Không thể truy cập camera.';

      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMessage = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép trong cài đặt trình duyệt.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy camera trên thiết bị của bạn.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
      }

      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScannerReady(false);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quét Mã QR
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', minHeight: 350 }}>
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 350,
              }}
            >
              <CircularProgress size={60} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Đang mở camera...
              </Typography>
            </Box>
          )}

          {error && !isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 350,
              }}
            >
              <Typography color="error" sx={{ textAlign: 'center' }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={startScanner}
                sx={{ mt: 2 }}
              >
                Thử lại
              </Button>
            </Box>
          )}

          <Box
            id="qr-reader"
            sx={{
              width: '100%',
              display: isLoading || error ? 'none' : 'block',
              '& video': {
                borderRadius: '8px',
                width: '50% !important',
              },
              '& #qr-shaded-region': {
                borderColor: '#4caf50 !important',
              },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Đưa mã QR vào trong khung để quét
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};
