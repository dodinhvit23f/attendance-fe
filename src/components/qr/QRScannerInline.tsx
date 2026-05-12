'use client';

import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {Html5Qrcode} from 'html5-qrcode';
import {useNotify} from '@/components/notification/NotificationProvider';

// Html5QrcodeState enum values
const HTML5_QRCODE_STATE_SCANNING = 2;
const HTML5_QRCODE_STATE_PAUSED = 3;

interface QRScannerInlineProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

// Detect in-app browsers / WebViews where getUserMedia is typically unavailable.
const detectInAppBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';

  // Known in-app browser signatures (Facebook, Instagram, Zalo, Line, WeChat, TikTok, ...).
  const inAppPatterns = [
    'FBAN', 'FBAV', 'FB_IAB',
    'Instagram',
    'Line/',
    'MicroMessenger',
    'Zalo',
    'TikTok', 'musical_ly', 'BytedanceWebview',
    'Twitter',
    'KAKAOTALK',
    'Snapchat',
    '; wv)', // Android WebView marker
  ];
  if (inAppPatterns.some((p) => ua.includes(p))) return true;

  // iOS app webviews: iOS UA without a real browser identifier.
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isRealIOSBrowser = /Safari\//.test(ua) || /CriOS\//.test(ua) || /FxiOS\//.test(ua) || /EdgiOS\//.test(ua);
  if (isIOS && !isRealIOSBrowser) return true;

  // Final feature check — if camera API is missing, treat as in-app browser.
  return !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function';
};

export const QRScannerInline: React.FC<QRScannerInlineProps> = ({
                                                                  onScan,
                                                                  onError,
                                                                }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {notifyError} = useNotify();

  const startScanner = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const scanner = new Html5Qrcode('qr-reader-inline');
      scannerRef.current = scanner;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 320;
      const qrSize = Math.max(180, Math.min(280, viewportWidth - 80));

      await scanner.start(
          {facingMode: 'environment'},
          {
            fps: 10,
            qrbox: {width: qrSize, height: qrSize},
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScan(decodedText);
            // Defer stop to next tick to avoid race condition on Android WebView
            setTimeout(() => {
              stopScanner();
            }, 0);
          },
          () => {
          }
      );

      if (isMountedRef.current) {
        setIsScannerReady(true);
      }
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

      if (isMountedRef.current) {
        setError(errorMessage);
        notifyError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === HTML5_QRCODE_STATE_SCANNING || state === HTML5_QRCODE_STATE_PAUSED) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScannerReady(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCaptureClick = () => {
    captureInputRef.current?.click();
  };

  const scanFileAsQR = async (file: File) => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-upload');
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.error('Error scanning image:', err);
      notifyError('Không thể đọc mã QR từ hình ảnh. Vui lòng thử lại.');
      onError?.('Không thể đọc mã QR từ hình ảnh.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await scanFileAsQR(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await scanFileAsQR(file);
    if (captureInputRef.current) {
      captureInputRef.current.value = '';
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const inApp = detectInAppBrowser();
    setIsInAppBrowser(inApp);

    if (inApp) {
      // Skip live camera entirely — rely on native capture / upload.
      setIsLoading(false);
      return () => {
        isMountedRef.current = false;
        stopScanner();
      };
    }

    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
      <Box sx={{position: 'relative', width: '100%', minHeight: 350}}>
        {isInAppBrowser ? (
            <Stack
                alignItems="center"
                spacing={2}
                sx={{minHeight: 280, justifyContent: 'center', px: 2}}
            >
              <Alert severity="info" sx={{width: '100%'}}>
                Trình duyệt trong ứng dụng không hỗ trợ camera trực tiếp. Vui lòng chụp ảnh mã QR hoặc tải ảnh lên.
              </Alert>
              <Button
                  variant="contained"
                  startIcon={<PhotoCameraIcon/>}
                  onClick={handleCaptureClick}
                  size="large"
                  sx={{borderRadius: '8px', minWidth: 220}}
              >
                Chụp ảnh mã QR
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{textAlign: 'center'}}>
                Để có trải nghiệm tốt nhất, hãy mở trang này trong Chrome hoặc Safari.
              </Typography>
            </Stack>
        ) : (
            <>
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
                    <CircularProgress size={60}/>
                    <Typography sx={{mt: 2}} color="text.secondary">
                      Đang mở camera...
                    </Typography>
                  </Box>
              )}

              {error && !isLoading && (
                  <Stack
                      alignItems="center"
                      spacing={2}
                      sx={{minHeight: 350, justifyContent: 'center', px: 2}}
                  >
                    <Typography color="error" sx={{textAlign: 'center'}}>
                      {error}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined" onClick={startScanner}>
                        Thử lại
                      </Button>
                      <Button
                          variant="contained"
                          startIcon={<PhotoCameraIcon/>}
                          onClick={handleCaptureClick}
                      >
                        Chụp ảnh
                      </Button>
                    </Stack>
                  </Stack>
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
                  }}
              />

              {isScannerReady && (
                  <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{mt: 2, textAlign: 'center'}}
                  >
                    Đưa mã QR vào trong khung để quét
                  </Typography>
              )}
            </>
        )}

        <Divider sx={{my: 2}}>hoặc</Divider>

        <Stack alignItems="center" spacing={1}>
          {!isInAppBrowser && (
              <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon/>}
                  onClick={handleCaptureClick}
                  sx={{borderRadius: '8px', minWidth: 200}}
              >
                Chụp ảnh mã QR
              </Button>
          )}
          <Button
              variant="outlined"
              startIcon={<UploadFileIcon/>}
              onClick={handleUploadClick}
              sx={{borderRadius: '8px', minWidth: 200}}
          >
            Tải ảnh từ thư viện
          </Button>
        </Stack>

        {/* Hidden inputs: one for gallery upload, one to trigger native camera capture */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{display: 'none'}}
        />
        <input
            type="file"
            ref={captureInputRef}
            onChange={handleCaptureChange}
            accept="image/*"
            capture="environment"
            style={{display: 'none'}}
        />

        {/* Hidden element for scanning uploaded/captured images */}
        <Box id="qr-reader-upload" sx={{display: 'none'}}/>
      </Box>
  );
};
