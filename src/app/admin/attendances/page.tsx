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
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {useEffect, useState} from 'react';
import { useLoading } from '@/components/root/client-layout';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { ShiftDialog } from '@/components/admin/ShiftDialog';
import { useNotify } from '@/components/notification/NotificationProvider';
import { getAttendances, assignShiftToAttendance, type Attendance } from '@/lib/api/admin/attendances';
import { getActiveEmployees, type ActiveEmployee } from '@/lib/api/admin/employees';
import { getShifts, type Shift } from '@/lib/api/admin/shifts';
import { ErrorMessage } from '@/lib/constants';
import { parseDate, parseDateTime } from '@/lib/api/types';
import dayjs from 'dayjs';

export default function AttendancesPage() {

  const { setLoading } = useLoading();
  const { notifySuccess, notifyError } = useNotify();
  const [statusFilter, setStatusFilter] = useState('all');
  const [cameraOpen, setCameraOpen] = useState(false);

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([]);
  const [selectedUserNames, setSelectedUserNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);
  const [shiftsLoaded, setShiftsLoaded] = useState(false);
  const [assignShiftDialogOpen, setAssignShiftDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const getShiftName = (shiftId: number | undefined) => {
    if (!shiftId) return null;
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || null;
  };

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await getAttendances({
        startDate,
        endDate,
        userNames: selectedUserNames.length > 0 ? selectedUserNames.join(',') : undefined,
      });
      if (response.data?.attendances) {
        setAttendances(response.data.attendances);
      } else {
        setAttendances([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch attendances:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể tải dữ liệu chấm công');
        notifyError(errorMessage);
      }
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Fetch active employees on component mount
  useEffect(() => {
    const fetchActiveEmployees = async () => {
      try {
        const response = await getActiveEmployees();
        setActiveEmployees(response.data.users);
        setEmployeesLoaded(true);
      } catch (error: any) {
        console.error('Failed to fetch active employees:', error);
        if (error instanceof Error) {
          const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể tải danh sách nhân viên');
          notifyError(errorMessage);
        }
        setEmployeesLoaded(true);
      }
    };

    if (!employeesLoaded) {
      fetchActiveEmployees();
    }
  }, [employeesLoaded, notifyError]);

  // Step 2: Fetch shifts after employees are loaded
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await getShifts();
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

    if (employeesLoaded && !shiftsLoaded) {
      fetchShifts();
    }
  }, [employeesLoaded, shiftsLoaded, notifyError]);

  // Step 3: Fetch attendances after employees and shifts are loaded
  useEffect(() => {
    if (employeesLoaded && shiftsLoaded) {
      fetchAttendances();
    }
  }, [startDate, endDate, selectedUserNames, employeesLoaded, shiftsLoaded]);

  const handleCloseCamera = () => {
    setCameraOpen(false);
  };

  const handleCapturePhoto = (imageData: string) => {
    // Handle the captured image (e.g., save to database, display, etc.)
    notifySuccess('Chụp ảnh thành công! Đang xử lý điểm danh...');
    // TODO: Send imageData to backend for attendance verification
  };


  const handleUserNameChange = (event: any) => {
    const value = event.target.value;
    setSelectedUserNames(typeof value === 'string' ? value.split(',') : value);
  };

  const handleOpenAssignShiftDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setSelectedShiftId('');
    setAssignShiftDialogOpen(true);
  };

  const handleCloseAssignShiftDialog = () => {
    setAssignShiftDialogOpen(false);
    setSelectedAttendance(null);
    setSelectedShiftId('');
  };

  const handleAssignShift = async () => {
    if (!selectedAttendance || !selectedShiftId) return;

    setIsAssigning(true);
    try {
      await assignShiftToAttendance(selectedAttendance.id, selectedShiftId);
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
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => setShiftDialogOpen(true)}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Ca Làm Việc
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <TextField
          label="Ngày bắt đầu"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        <TextField
          label="Ngày kết thúc"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Nhân viên</InputLabel>
          <Select
            multiple
            value={selectedUserNames}
            onChange={handleUserNameChange}
            input={<OutlinedInput label="Nhân viên" />}
            renderValue={(selected) => selected.join(', ')}
            sx={{ borderRadius: '8px' }}
          >
            {activeEmployees && activeEmployees.map((employee) => (
              <MenuItem key={employee.userName} value={employee.userName}>
                <Checkbox checked={selectedUserNames.indexOf(employee.userName) > -1} />
                <ListItemText primary={employee.userName} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="present">Có mặt</MenuItem>
            <MenuItem value="late">Đi muộn</MenuItem>
            <MenuItem value="absent">Vắng mặt</MenuItem>
          </Select>
        </FormControl>
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
              <TableCell sx={{ fontWeight: 600 }}>Ca</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ border: 0 }}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Không có dữ liệu chấm công
                    </Typography>
                    <Typography color="text.secondary">
                      Không tìm thấy bản ghi chấm công trong khoảng thời gian đã chọn
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
                attendances.map((attendance) => (
                <TableRow
                  key={attendance.id}
                  sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
                >
                  <TableCell>{attendance.id}</TableCell>
                  <TableCell>{attendance.fullName}</TableCell>
                  <TableCell>{parseDate(attendance.checkInDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    {attendance.checkIn ? (
                      <Chip label={parseDateTime(attendance.checkIn).format('HH:mm')} size="small" variant="outlined" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {attendance.checkOut ? (
                      <Chip label={parseDateTime(attendance.checkOut).format('HH:mm')} size="small" variant="outlined" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
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
                          fontSize: '0.75rem',
                        }}
                      >
                        Phân Ca
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhân viên: <strong>{selectedAttendance?.fullName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ngày: <strong>{selectedAttendance ? parseDate(selectedAttendance.checkInDate).format('DD/MM/YYYY') : ''}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
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

      {/* Camera Capture Dialog */}
      <CameraCapture
        open={cameraOpen}
        onClose={handleCloseCamera}
        onCapture={handleCapturePhoto}
      />

      {/* Shift Management Dialog */}
      <ShiftDialog
        open={shiftDialogOpen}
        onClose={() => setShiftDialogOpen(false)}
      />
    </Box>
  );
}
