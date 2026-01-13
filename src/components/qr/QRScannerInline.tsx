'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Html5Qrcode } from 'html5-qrcode';
import { useNotify } from '@/components/notification/NotificationProvider';

interface QRScannerInlineProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export const QRScannerInline: React.FC<QRScannerInlineProps> = ({
  onScan,
  onError,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyError } = useNotify();

  const startScanner = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode('qr-reader-inline');
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
      onError?.(errorMessage);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-upload');
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.error('Error scanning image:', err);
      notifyError('Không thể đọc mã QR từ hình ảnh. Vui lòng thử lại.');
      onError?.('Không thể đọc mã QR từ hình ảnh.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
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
        id="qr-reader-inline"
        sx={{
          width: '100%',
          display: isLoading || error ? 'none' : 'block',
          '& video': {
            borderRadius: '8px',
            width: '100% !important',
          },
          '& #qr-shaded-region': {
            borderColor: '#4caf50 !important',
          },
        }}
      />

      {isScannerReady && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          Đưa mã QR vào trong khung để quét
        </Typography>
      )}

      {/* Divider */}
      <Divider sx={{ my: 2 }}>hoặc</Divider>

      {/* Upload Image Button */}
      <Stack alignItems="center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleUploadClick}
          sx={{ borderRadius: '8px' }}
        >
          Tải ảnh mã QR
        </Button>
      </Stack>

      {/* Hidden element for scanning uploaded images */}
      <Box id="qr-reader-upload" sx={{ display: 'none' }} />
    </Box>
  );
};
