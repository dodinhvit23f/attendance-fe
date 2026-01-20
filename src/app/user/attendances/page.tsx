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
  IconButton,
  Tooltip,
  Divider,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'react-qr-code';
import { useEffect, useState, useCallback } from 'react';
import { recordUserAttendance, getUserAttendances, UserAttendance } from '@/lib/api/user/attendance';
import { parseDate, parseDateTime } from '@/lib/api/types';
import { getUserFacilities, UserFacility } from '@/lib/api/user/facilities';
import { useNotify } from '@/components/notification/NotificationProvider';
import { MapPicker } from '@/components/admin/MapPicker';
import { useLoading } from "@/components/root/client-layout";
import { QRScannerInline } from '@/components/qr/QRScannerInline';
import dayjs from 'dayjs';

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

export default function UserAttendancesPage() {
  const { notifyError, notifySuccess } = useNotify();
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [openDialog, setOpenDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [facilities, setFacilities] = useState<UserFacility[]>([]);
  const [attendances, setAttendances] = useState<UserAttendance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { setLoading } = useLoading();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserAttendances({
        startDate,
        endDate,
        page,
        size: rowsPerPage,
        sort: 'id,desc',
      });
      if (response.data?.attendances) {
        setAttendances(response.data.attendances);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
      notifyError('Không thể tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, page, rowsPerPage]);

  // Fetch facilities and attendances on page load
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getUserFacilities();
        if (Array.isArray(response.data)) {
          setFacilities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
      }
    };

    fetchFacilities();
    fetchAttendances();
  }, [fetchAttendances]);

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
    setShowQRScanner(false);
  };

  const handleShowQRScanner = () => {
    setShowQRScanner(true);
  };

  const handleBackFromScanner = () => {
    setShowQRScanner(false);
  };

  const handleOpenQRDialog = () => {
    setOpenQRDialog(true);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
  };

  const handleCopyQR = async (facilityId: number) => {
    const qrValue = facilityId.toString();
    try {
      await navigator.clipboard.writeText(qrValue);
      notifySuccess('Đã sao chép mã QR!');
    } catch {
      notifyError('Không thể sao chép mã QR.');
    }
  };

  const handleDownloadQR = (facilityId: number, facilityName: string) => {
    const svg = document.getElementById(`qr-${facilityId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${facilityName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = (facilityId: number, facilityName: string) => {
    const svg = document.getElementById(`qr-${facilityId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${facilityName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h2 { margin-bottom: 20px; }
            svg {
              width: 250px;
              height: 250px;
            }
          </style>
        </head>
        <body>
          <h2>${facilityName}</h2>
          ${svgData}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleQRScan = async (scannedData: string) => {
    // Parse QR data as JSON (facility object)
    let scannedFacility: UserFacility | null = null;
    try {
      scannedFacility = JSON.parse(scannedData) as UserFacility;
    } catch {
      notifyError('Mã QR không hợp lệ. Vui lòng thử lại.');
      setShowQRScanner(false);
      return;
    }

    // Find matching facility from the list
    const matchedFacility = facilities.find(
      (facility) => facility.id === scannedFacility?.id
    );

    if (!matchedFacility) {
      notifyError('Mã QR không khớp với cơ sở nào. Vui lòng thử lại.');
      setShowQRScanner(false);
      return;
    }

    if (!userLocation) {
      notifyError('Không thể xác định vị trí của bạn.');
      setShowQRScanner(false);
      return;
    }

    // Check if user is within range of the matched facility
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      matchedFacility.latitude,
      matchedFacility.longitude
    );

    if (distance > matchedFacility.allowDistance) {
      notifyError(
        `Bạn đang ở ngoài phạm vi cho phép của ${matchedFacility.name}. Khoảng cách: ${Math.round(distance)}m`
      );
      setShowQRScanner(false);
      return;
    }

    // Call API to record attendance
    try {
      setLoading(true);
      await recordUserAttendance({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        facilityId: matchedFacility.id,
      });
      notifySuccess('Chấm công thành công!');
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to record attendance:', error);
      notifyError('Không thể ghi nhận chấm công. Vui lòng thử lại.');
      setShowQRScanner(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 1.5, sm: 0 }}
        mb={2}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Quản Lý Chấm Công
        </Typography>
        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
          <Button
            variant="outlined"
            startIcon={<QrCode2Icon />}
            onClick={handleOpenQRDialog}
            size="small"
            sx={{ borderRadius: '8px', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Mã QR
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="small"
            sx={{ borderRadius: '8px', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Chấm công
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        <TextField
          label="Từ ngày"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: { xs: 130, sm: 160 }, flex: { xs: 1, sm: 'none' } }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: { xs: 130, sm: 160 }, flex: { xs: 1, sm: 'none' } }}
        />
      </Stack>

      {/* Attendance Table */}
      <TableContainer component={Paper} elevation={2} sx={{ maxWidth: '100%' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Nhân Viên</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Ngày</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Vào</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>Ra</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ border: 0 }}>
                  <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Chưa có dữ liệu
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{attendance.id}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 80, sm: 'none' }, overflow: 'hidden', textOverflow: 'ellipsis' }}>{attendance.fullName}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{parseDate(attendance.checkInDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{parseDateTime(attendance.checkIn).format('HH:mm')}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {attendance.checkOut ? parseDateTime(attendance.checkOut).format('HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 30, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({from, to, count}) =>
            `${from}-${to} trên tổng ${count !== -1 ? count : `nhiều hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {showQRScanner ? 'Quét Mã QR' : 'Chấm công'}
        </DialogTitle>
        <DialogContent>
          {showQRScanner ? (
            <QRScannerInline onScan={handleQRScan} />
          ) : !userLocation ? (
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
          {showQRScanner ? (
            <Button onClick={handleBackFromScanner}>Quay lại</Button>
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Đóng</Button>
              <Button
                variant="contained"
                disabled={!userLocation || !facilityInRange}
                onClick={handleShowQRScanner}
              >
                Xác nhận chấm công
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Facilities QR Codes Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog} maxWidth="md" fullWidth>
        <DialogTitle>Mã QR Các Cơ Sở</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {facilities.map((facility, index) => (
              <Box key={facility.id}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                >
                  {/* QR Code */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    <QRCode
                      id={`qr-${facility.id}`}
                      value={JSON.stringify(facility)}
                      size={150}
                    />
                  </Box>

                  {/* Facility Info & Actions */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {facility.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {facility.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Mã cơ sở: {facility.id}
                    </Typography>

                    {/* Action Icons */}
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Sao chép mã">
                        <IconButton
                          onClick={() => handleCopyQR(facility.id)}
                          sx={{
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Tải xuống">
                        <IconButton
                          onClick={() => handleDownloadQR(facility.id, facility.name)}
                          sx={{
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="In">
                        <IconButton
                          onClick={() => handlePrintQR(facility.id, facility.name)}
                          sx={{
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                          }}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>
                {index < facilities.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}

            {facilities.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Chưa có cơ sở nào
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}