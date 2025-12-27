'use client';

import React, { useRef, useState, useEffect } from 'react';
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
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import { useNotify } from '@/components/notification/NotificationProvider';

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  open,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { notifyError } = useNotify();

  // Start camera
  const startCamera = async () => {
    setIsLoading(true);
    try {
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
          setIsLoading(false);
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setIsLoading(false);

      let errorMessage = 'Không thể truy cập camera.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép trong cài đặt trình duyệt.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Không tìm thấy camera trên thiết bị của bạn.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Thiết bị không hỗ trợ các yêu cầu camera được chỉ định.';
      }

      notifyError(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  // Capture photo
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
  };

  // Confirm captured photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Switch camera (front/back)
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Close dialog
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
            Chụp Ảnh Điểm Danh
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', minHeight: 400 }}>
          {/* Loading State */}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
              }}
            >
              <CircularProgress size={60} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Đang mở camera...
              </Typography>
            </Box>
          )}

          {/* Camera Preview or Captured Image */}
          {!isLoading && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                bgcolor: 'black',
              }}
            >
              {/* Video Preview */}
              {!capturedImage && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: isCameraReady ? 'block' : 'none',
                    }}
                  />

                  {/* Switch Camera Button (Mobile Only) */}
                  {isCameraReady && (
                    <IconButton
                      onClick={handleSwitchCamera}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                    >
                      <FlipCameraIosIcon />
                    </IconButton>
                  )}
                </>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              )}
            </Box>
          )}

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>

        {!isCameraReady && !isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            💡 Vui lòng cho phép truy cập camera khi trình duyệt hỏi
          </Typography>
        )}
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
          Hủy
        </Button>

        {!capturedImage ? (
          <Button
            onClick={handleCapture}
            variant="contained"
            disabled={!isCameraReady}
            startIcon={<CameraAltIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
            }}
          >
            Chụp Ảnh
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              onClick={handleRetake}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
              }}
            >
              Chụp Lại
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
              }}
            >
              Xác Nhận
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};
