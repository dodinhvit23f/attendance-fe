'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState, useCallback } from 'react';
import { getManagerFacilities, ManagerFacility } from '@/lib/api/manager/facilities';
import { useNotify } from '@/components/notification/NotificationProvider';
import { MapPicker } from '@/components/admin/MapPicker';
import {useLoading} from "@/components/root/client-layout";

const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function ManagerAttendancesPage() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { notifyError } = useNotify();
  const [startDate, setStartDate] = useState(getDateString(today));
  const [endDate, setEndDate] = useState(getDateString(tomorrow));
  const [openDialog, setOpenDialog] = useState(false);
  const [facilities, setFacilities] = useState<ManagerFacility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { setLoading } = useLoading();

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getManagerFacilities();
        if (Array.isArray(response.data)) {
          setFacilities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
      }
    };

    fetchFacilities();
    setLoading(false)
  }, []);

  // Check if user is within range of any facility
  const facilityInRange = userLocation
    ? facilities.find((facility) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          facility.latitude,
          facility.longitude
        );
        return distance <= facility.allowDistance;
      })
    : null;

  // Request location permission when dialog opens
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      notifyError('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            notifyError('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền để chấm công.');
            break;
          case error.POSITION_UNAVAILABLE:
            notifyError('Không thể xác định vị trí của bạn.');
            break;
          case error.TIMEOUT:
            notifyError('Yêu cầu vị trí đã hết thời gian chờ.');
            break;
          default:
            notifyError('Đã xảy ra lỗi khi lấy vị trí.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [notifyError]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    requestLocationPermission();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserLocation(null);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Quản Lý Chấm Công
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: '8px' }}
        >
          Chấm công
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <TextField
          label="Từ ngày"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
      </Stack>

      {/* Attendance Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nhân Viên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giờ Vào</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giờ Ra</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} sx={{ border: 0 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Chưa có dữ liệu
                  </Typography>
                  <Typography color="text.secondary">
                    Trang quản lý chấm công đang được phát triển
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chấm công</DialogTitle>
        <DialogContent>
          {!userLocation ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Đang chờ quyền truy cập vị trí...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Facility List with Distance */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Danh sách cơ sở:
                </Typography>
                {facilities.map((facility) => {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    facility.latitude,
                    facility.longitude
                  );
                  const isWithinRange = distance <= facility.allowDistance;

                  return (
                    <Box
                      key={facility.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: '8px',
                        border: isWithinRange ? '2px solid #4caf50' : '1px solid #E0E0E0',
                        backgroundColor: isWithinRange ? '#e8f5e9' : 'transparent',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {facility.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {facility.address}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: isWithinRange ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        Khoảng cách: {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(2)} km`}
                        {isWithinRange ? ' (Trong phạm vi)' : ` (Ngoài phạm vi ${facility.allowDistance}m)`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Map */}
              {facilities.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Bản đồ:
                  </Typography>
                  <MapPicker
                    latitude={facilities[0].latitude}
                    longitude={facilities[0].longitude}
                    onLocationChange={() => {}}
                    userLocation={userLocation}
                    facilities={facilities.map((facility) => ({
                      id: facility.id,
                      name: facility.name,
                      latitude: facility.latitude,
                      longitude: facility.longitude,
                      distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        facility.latitude,
                        facility.longitude
                      ),
                    }))}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button
            variant="contained"
            disabled={!userLocation || !facilityInRange}
          >
            Xác nhận chấm công
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}