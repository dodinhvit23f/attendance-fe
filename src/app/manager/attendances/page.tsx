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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  TablePagination,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'react-qr-code';
import { useEffect, useState, useCallback } from 'react';
import { getManagerFacilities, ManagerFacility } from '@/lib/api/manager/facilities';
import { recordAttendance, getManagerAttendances, assignShiftToManagerAttendance, Attendance, recordManualAttendance } from '@/lib/api/manager/attendance';
import { getManagerUsers, ManagerEmployee } from '@/lib/api/manager/users';
import { getManagerShifts, Shift } from '@/lib/api/manager/shifts';
import { parseDate, parseDateTime } from '@/lib/api/types';
import { ErrorMessage } from '@/lib/constants';
import { useNotify } from '@/components/notification/NotificationProvider';
import { MapPicker } from '@/components/admin/MapPicker';
import { useLoading } from "@/components/root/client-layout";
import { QRScannerInline } from '@/components/qr/QRScannerInline';
import { BulkShiftAssignmentDialog } from '@/components/manager/BulkShiftAssignmentDialog';
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

export default function ManagerAttendancesPage() {
  const { notifyError, notifySuccess } = useNotify();
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [openDialog, setOpenDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [facilities, setFacilities] = useState<ManagerFacility[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { setLoading } = useLoading();

  // Shift management state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoaded, setShiftsLoaded] = useState(false);
  const [assignShiftDialogOpen, setAssignShiftDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignShiftDate, setAssignShiftDate] = useState<dayjs.Dayjs | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Bulk shift assignment state
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);

  // Manual attendance state
  const [manualAttendanceDialogOpen, setManualAttendanceDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<ManagerEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedShiftIdManual, setSelectedShiftIdManual] = useState<number | ''>('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | ''>('');
  const [checkInDate, setCheckInDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Predefined reasons
  const PREDEFINED_REASONS = [
    'Thiết bị của nhân viên không hoạt động',
    'Nhân viên quên thiết bị',
    'Lỗi hệ thống chấm công',
    'Nhân viên đi công tác',
    'Khác (vui lòng nhập lý do)',
  ];

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoading(true);
      const response = await getManagerAttendances({
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
      setIsLoading(false);
      setLoading(false);
    }
  }, [startDate, endDate, page, rowsPerPage]);

  // Fetch facilities and attendances on page load
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
    fetchAttendances();
  }, [fetchAttendances]);

  // Fetch shifts on mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await getManagerShifts();
        setShifts(response.data.shifts || []);
        setShiftsLoaded(true);
      } catch (error: any) {
        console.error('Failed to fetch shifts:', error);
        if (error instanceof Error) {
          const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể tải danh sách ca làm việc');
          notifyError(errorMessage);
        }
        setShiftsLoaded(true);
      }
    };

    if (!shiftsLoaded) {
      fetchShifts();
    }
  }, [shiftsLoaded]);

  // Helper function to get shift name by ID
  const getShiftName = (shiftId: number | undefined) => {
    if (!shiftId) return null;
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || null;
  };

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

  const handleOpenAssignShiftDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setSelectedShiftId('');
    setAssignShiftDate(parseDate(attendance.checkInDate));
    setAssignShiftDialogOpen(true);
  };

  const handleCloseAssignShiftDialog = () => {
    setAssignShiftDialogOpen(false);
    setSelectedAttendance(null);
    setSelectedShiftId('');
    setAssignShiftDate(null);
  };

  const handleAssignShift = async () => {
    if (!selectedAttendance || !selectedShiftId) return;

    setIsAssigning(true);
    try {
      await assignShiftToManagerAttendance(selectedAttendance.id, selectedShiftId);
      notifySuccess('Phân ca thành công!');
      handleCloseAssignShiftDialog();
      // Update local state instead of reloading
      setAttendances((prevAttendances) =>
        prevAttendances.map((attendance) =>
          attendance.id === selectedAttendance.id
            ? { ...attendance, shiftId: selectedShiftId as number }
            : attendance
        )
      );
    } catch (error: any) {
      console.error('Failed to assign shift:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể phân ca');
        notifyError(errorMessage);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Bulk shift assignment handlers
  const handleOpenBulkAssignDialog = () => {
    setBulkAssignDialogOpen(true);
  };

  const handleCloseBulkAssignDialog = () => {
    setBulkAssignDialogOpen(false);
  };

  // Manual attendance handlers
  const handleOpenManualAttendanceDialog = async () => {
    setManualAttendanceDialogOpen(true);
    // Fetch employees
    try {
      const response = await getManagerUsers({ size: 1000 });
      setEmployees(response.data.employees.filter(emp => emp.active));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      notifyError('Không thể tải danh sách nhân viên');
    }
  };

  const handleCloseManualAttendanceDialog = () => {
    setManualAttendanceDialogOpen(false);
    setSelectedEmployeeId('');
    setSelectedShiftIdManual('');
    setSelectedFacilityId('');
    setCheckInDate(dayjs().format('YYYY-MM-DD'));
    setCheckInTime('08:00');
    setCheckOutTime('17:00');
    setSelectedReason('');
    setCustomReason('');
    setReasonError('');
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
    setReasonError('');
    if (reason !== 'Khác (vui lòng nhập lý do)') {
      setCustomReason('');
    }
  };

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value);
    if (value.length > 300) {
      setReasonError('Lý do không được vượt quá 300 ký tự');
    } else {
      setReasonError('');
    }
  };

  const handleSubmitManualAttendance = async () => {
    // Validation
    if (!selectedEmployeeId || !selectedShiftIdManual || !selectedFacilityId) {
      notifyError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const finalReason = selectedReason === 'Khác (vui lòng nhập lý do)' ? customReason : selectedReason;

    if (!finalReason) {
      notifyError('Vui lòng chọn lý do');
      return;
    }

    if (finalReason.length > 300) {
      setReasonError('Lý do không được vượt quá 300 ký tự');
      return;
    }

    // Format datetime strings
    const checkInDateTime = `${checkInDate}T${checkInTime}:00.000+07:00`;
    const checkOutDateTime = `${checkInDate}T${checkOutTime}:00.000+07:00`;

    try {
      setIsSubmittingManual(true);
      setLoading(true);
      await recordManualAttendance({
        employeeId: selectedEmployeeId as number,
        shiftId: selectedShiftIdManual as number,
        checkInDate,
        checkInTime: checkInDateTime,
        checkOutTime: checkOutDateTime,
        facilityId: selectedFacilityId as number,
        reason: finalReason,
      });
      notifySuccess('Đã ghi nhận chấm công thủ công!');
      handleCloseManualAttendanceDialog();
      fetchAttendances();
    } catch (error: any) {
      console.error('Failed to record manual attendance:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể ghi nhận chấm công');
        notifyError(errorMessage);
      }
    } finally {
      setIsSubmittingManual(false);
      setLoading(false);
    }
  };

  const handleCopyQR = async (facilityId: number) => {
    const svg = document.getElementById(`qr-${facilityId}`);
    if (!svg) {
      notifyError('Không tìm thấy mã QR.');
      return;
    }

    try {
      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Convert SVG to PNG blob
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            try {
              // Write image to clipboard
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              notifySuccess('Đã sao chép mã QR!');
              resolve();
            } catch (clipboardError) {
              reject(clipboardError);
            }
          }, 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      });
    } catch (error) {
      console.error('Failed to copy QR code:', error);
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
      canvas.width = 500;
      canvas.height = 500;
      ctx?.drawImage(img, 0, 0, 500, 500);
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
    let scannedFacility: ManagerFacility | null = null;
    try {
      scannedFacility = JSON.parse(scannedData) as ManagerFacility;
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
      await recordAttendance({
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
        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
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
            variant="outlined"
            onClick={handleOpenBulkAssignDialog}
            size="small"
            sx={{ borderRadius: '8px', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Phân Ca
          </Button>
          <Button
            variant="outlined"
            onClick={handleOpenManualAttendanceDialog}
            size="small"
            sx={{ borderRadius: '8px', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Chấm Công Thủ Công
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
      <Box sx={{
        height: 'calc(100vh - 260px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            maxWidth: '100%',
            flex: 1,
            overflow: 'auto',
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Định Danh</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Nhân Viên</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Ngày</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Giờ Vào</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Giờ Ra</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', backgroundColor: '#F5F5F5' }}>Ca</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap',backgroundColor: '#F5F5F5' }}>Tạo Bởi</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap',backgroundColor: '#F5F5F5' }}>Thay Đổi Bởi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                      <CircularProgress size={40} sx={{ mr: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Đang tải dữ liệu...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 0 }}>
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
                    <TableCell
                        title={attendance.userName}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          maxWidth: { xs: 80, sm: 150, md: 200 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                    >
                      {attendance.userName}
                    </TableCell>
                    <TableCell
                      title={attendance.fullName}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        maxWidth: { xs: 80, sm: 150, md: 200 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {attendance.fullName}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{parseDate(attendance.checkInDate).format('DD/MM/YYYY')}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{attendance.checkIn ? parseDateTime(attendance.checkIn).format('HH:mm') : '-'}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {attendance.checkOut ? parseDateTime(attendance.checkOut).format('HH:mm') : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {attendance.shiftId ? (
                        <Chip
                          label={getShiftName(attendance.shiftId) || `Ca ${attendance.shiftId}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenAssignShiftDialog(attendance)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          }}
                        >
                          Chọn Ca
                        </Button>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 100, sm: 150 } }}>
                      {attendance.insertedBy ? (
                          <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={attendance.insertedBy}
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                            }}
                          />
                      ) : ('-')}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 120, sm: 180 } }}>
                      {attendance.updatedBy ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: { xs: 0.5, sm: 0.75 },
                              alignItems: 'center',
                            }}
                          >
                            {attendance.updatedBy.split(",").map(
                              (username) => (
                                <Chip
                                  key={`user-${username}`}
                                  color="primary"
                                  variant="outlined"
                                  label={username.trim()}
                                  size="small"
                                  sx={{
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                    height: { xs: 20, sm: 24 },
                                  }}
                                />
                              )
                            )}
                          </Box>
                      ) : ('-')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[30, 50]}
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
      </Box>

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

      {/* Assign Shift Dialog */}
      <Dialog
        open={assignShiftDialogOpen}
        onClose={handleCloseAssignShiftDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Phân Ca Làm Việc
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Nhân viên: <strong>{selectedAttendance?.fullName}</strong>
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Ngày:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={assignShiftDate}
                  onChange={(newDate) => setAssignShiftDate(newDate)}
                  readOnly
                  sx={{
                    width: '100%',
                    '& .MuiPickersCalendarHeader-root': {
                      paddingLeft: 1,
                      paddingRight: 1,
                    },
                    '& .MuiDayCalendar-header': {
                      justifyContent: 'space-around',
                    },
                    '& .MuiPickersDay-root': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Chọn Ca</InputLabel>
              <Select
                value={selectedShiftId}
                label="Chọn Ca"
                onChange={(e) => setSelectedShiftId(e.target.value as number)}
                sx={{ borderRadius: '8px' }}
              >
                {shifts.filter(s => s.isActive).map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseAssignShiftDialog}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAssignShift}
            variant="contained"
            disabled={!selectedShiftId || isAssigning}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {isAssigning ? <CircularProgress size={20} color="inherit" /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Shift Assignment Dialog */}
      <BulkShiftAssignmentDialog
        open={bulkAssignDialogOpen}
        onClose={handleCloseBulkAssignDialog}
        shifts={shifts}
      />

      {/* Manual Attendance Dialog */}
      <Dialog
        open={manualAttendanceDialogOpen}
        onClose={handleCloseManualAttendanceDialog}
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
        <DialogTitle sx={{ fontWeight: 600 }}>
          Chấm Công Thủ Công
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Employee Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Chọn nhân viên *</InputLabel>
              <Select
                value={selectedEmployeeId}
                label="Chọn nhân viên *"
                onChange={(e) => setSelectedEmployeeId(e.target.value as number)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="" disabled>
                  Chọn nhân viên
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.fullName} ({employee.employeeId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Facility Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Chọn cơ sở *</InputLabel>
              <Select
                value={selectedFacilityId}
                label="Chọn cơ sở *"
                onChange={(e) => setSelectedFacilityId(e.target.value as number)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="" disabled>
                  Chọn cơ sở
                </MenuItem>
                {facilities.map((facility) => (
                  <MenuItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Shift Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Chọn ca *</InputLabel>
              <Select
                value={selectedShiftIdManual}
                label="Chọn ca *"
                onChange={(e) => setSelectedShiftIdManual(e.target.value as number)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="" disabled>
                  Chọn ca
                </MenuItem>
                {shifts.filter(s => s.isActive).map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Check-in Date */}
            <TextField
              label="Ngày chấm công *"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              inputProps={{
                max: dayjs().format('YYYY-MM-DD'),
              }}
              sx={{ borderRadius: '8px' }}
            />

            {/* Check-in Time */}
            <TextField
              label="Giờ vào *"
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              sx={{ borderRadius: '8px' }}
            />

            {/* Check-out Time */}
            <TextField
              label="Giờ ra *"
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              sx={{ borderRadius: '8px' }}
            />

            {/* Reason Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Lý do *</InputLabel>
              <Select
                value={selectedReason}
                label="Lý do *"
                onChange={(e) => handleReasonChange(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="" disabled>
                  Chọn lý do
                </MenuItem>
                {PREDEFINED_REASONS.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custom Reason Input */}
            {selectedReason === 'Khác (vui lòng nhập lý do)' && (
              <TextField
                label="Nhập lý do *"
                multiline
                rows={3}
                value={customReason}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
                error={!!reasonError}
                helperText={reasonError || `${customReason.length}/300 ký tự`}
                fullWidth
                size="small"
                sx={{ borderRadius: '8px' }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseManualAttendanceDialog}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitManualAttendance}
            variant="contained"
            disabled={isSubmittingManual || !selectedEmployeeId || !selectedShiftIdManual || !selectedFacilityId || !selectedReason || (selectedReason === 'Khác (vui lòng nhập lý do)' && (!customReason || !!reasonError))}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {isSubmittingManual ? <CircularProgress size={20} color="inherit" /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}