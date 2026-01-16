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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {useCallback, useEffect, useState} from 'react';
import { useLoading } from '@/components/root/client-layout';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { useNotify } from '@/components/notification/NotificationProvider';
import { getAttendances, type Attendance } from '@/lib/api/admin/attendances';
import { getActiveEmployees, type ActiveEmployee } from '@/lib/api/admin/employees';
import { ErrorMessage } from '@/lib/constants';
import { parseDate, parseDateTime } from '@/lib/api/types';
import dayjs from 'dayjs';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return 'success';
    case 'late':
      return 'warning';
    case 'absent':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'present':
      return 'Có mặt';
    case 'late':
      return 'Đi muộn';
    case 'absent':
      return 'Vắng mặt';
    default:
      return 'Không xác định';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'present':
      return <CheckCircleIcon fontSize="small" />;
    case 'late':
      return <AccessTimeIcon fontSize="small" />;
    case 'absent':
      return <CancelIcon fontSize="small" />;
    default:
      return null;
  }
};

export default function AttendancesPage() {

  const { setLoading } = useLoading();
  const { notifySuccess, notifyError } = useNotify();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([]);
  const [selectedUserNames, setSelectedUserNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

  // Fetch active employees
  useEffect(() => {
    const fetchActiveEmployees = async () => {
      try {
        const response = await getActiveEmployees();
        setActiveEmployees(response.data.users);
      } catch (error: any) {
        console.error('Failed to fetch active employees:', error);
        if (error instanceof Error) {
          const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể tải danh sách nhân viên');
          notifyError(errorMessage);
        }
      }
    };

    fetchActiveEmployees();
  }, [notifyError]);

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
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
  }, [startDate, endDate, selectedUserNames, setLoading, notifyError]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const handleOpenCamera = () => {
    setCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setCameraOpen(false);
  };

  const handleCapturePhoto = (imageData: string) => {
    // Handle the captured image (e.g., save to database, display, etc.)
    console.log('Captured image:', imageData.substring(0, 50) + '...');
    notifySuccess('Chụp ảnh thành công! Đang xử lý điểm danh...');
    // TODO: Send imageData to backend for attendance verification
  };


  const handleUserNameChange = (event: any) => {
    const value = event.target.value;
    setSelectedUserNames(typeof value === 'string' ? value.split(',') : value);
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
        {/*<Button
          variant="contained"
          startIcon={<CameraAltIcon />}
          onClick={handleOpenCamera}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Chấm Công
        </Button>*/}
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

      {/* Statistics Cards */}
      { /*<Stack direction="row" spacing={2} mb={3}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {attendances.filter(a => a.status === 'present').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Có mặt
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <AccessTimeIcon color="warning" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {attendances.filter(a => a.status === 'late').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đi muộn
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CancelIcon color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {attendances.filter(a => a.status === 'absent').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vắng mặt
            </Typography>
          </Box>
        </Paper>
      </Stack>*/}

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
              <TableCell sx={{ fontWeight: 600 }}>Thời Gian</TableCell>
              {/*<TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>*/}
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
                  {/*<TableCell>{attendance.duration || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(attendance.status)}
                      color={getStatusColor(attendance.status)}
                      size="small"
                    />
                  </TableCell>*/}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Camera Capture Dialog */}
      <CameraCapture
        open={cameraOpen}
        onClose={handleCloseCamera}
        onCapture={handleCapturePhoto}
      />
    </Box>
  );
}
