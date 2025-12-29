'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {useLoading} from "@/components/root/client-layout";

interface PermissionStatus {
  granted: boolean;
  loading: boolean;
  error: string | null;
}

export default function UserDashboard() {

  const { setLoading } = useLoading();

  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>({
    granted: false,
    loading: false,
    error: null,
  });

  const [locationPermission, setLocationPermission] = useState<PermissionStatus>({
    granted: false,
    loading: false,
    error: null,
  });

  // Automatically request permissions when page loads
  useEffect(() => {
    requestAllPermissions();
    setLoading(false);
  }, []);

  const requestAllPermissions = async () => {
    // Request camera permission
    await requestCameraPermission();

    // Request location permission
    await requestLocationPermission();
  };

  const requestCameraPermission = async () => {
    setCameraPermission({ granted: false, loading: true, error: null });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Stop the stream immediately - we only need permission
      stream.getTracks().forEach(track => track.stop());

      setCameraPermission({ granted: true, loading: false, error: null });
    } catch (error) {
      setCameraPermission({
        granted: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Không thể truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.',
      });
    }
  };

  const requestLocationPermission = async () => {
    setLocationPermission({ granted: false, loading: true, error: null });

    if (!('geolocation' in navigator)) {
      setLocationPermission({
        granted: false,
        loading: false,
        error: 'Trình duyệt không hỗ trợ định vị',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location granted:', position.coords);
        setLocationPermission({ granted: true, loading: false, error: null });
      },
      (error) => {
        setLocationPermission({
          granted: false,
          loading: false,
          error: error.message || 'Không thể truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Box sx={{ width: '100%', p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Dashboard Người Dùng
      </Typography>
    </Box>
  );
}
