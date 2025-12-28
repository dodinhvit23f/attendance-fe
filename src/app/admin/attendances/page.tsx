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
  InputLabel, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useEffect } from 'react';
import { useLoading } from '@/components/root/client-layout';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { useNotify } from '@/components/notification/NotificationProvider';

// Mock data
const mockAttendances = [
  {
    id: 1,
    employeeName: 'Nguyễn Văn A',
    date: '2025-12-14',
    checkIn: '08:30',
    checkOut: '17:45',
    status: 'present',
    duration: '9h 15m',
  },
  {
    id: 2,
    employeeName: 'Trần Thị B',
    date: '2025-12-14',
    checkIn: '08:45',
    checkOut: '18:00',
    status: 'present',
    duration: '9h 15m',
  },
  {
    id: 3,
    employeeName: 'Lê Văn C',
    date: '2025-12-14',
    checkIn: '09:15',
    checkOut: '-',
    status: 'late',
    duration: '-',
  },
  {
    id: 4,
    employeeName: 'Phạm Thị D',
    date: '2025-12-14',
    checkIn: '-',
    checkOut: '-',
    status: 'absent',
    duration: '-',
  },
  {
    id: 5,
    employeeName: 'Hoàng Văn E',
    date: '2025-12-13',
    checkIn: '08:00',
    checkOut: '17:30',
    status: 'present',
    duration: '9h 30m',
  },
];

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
  const { notifySuccess } = useNotify();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [cameraOpen, setCameraOpen] = React.useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

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

  const filteredAttendances = mockAttendances.filter((attendance) => {
    const matchesSearch = attendance.employeeName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || attendance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          startIcon={<CameraAltIcon />}
          onClick={handleOpenCamera}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Chụp Ảnh Điểm Danh
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          placeholder="Tìm kiếm theo tên nhân viên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flexGrow: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
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
      <Stack direction="row" spacing={2} mb={3}>
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
              3
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
              1
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
              1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vắng mặt
            </Typography>
          </Box>
        </Paper>
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
              <TableCell sx={{ fontWeight: 600 }}>Thời Gian</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendances.map((attendance) => (
              <TableRow
                key={attendance.id}
                sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
              >
                <TableCell>{attendance.id}</TableCell>
                <TableCell>{attendance.employeeName}</TableCell>
                <TableCell>{attendance.date}</TableCell>
                <TableCell>
                  {attendance.checkIn !== '-' ? (
                    <Chip label={attendance.checkIn} size="small" variant="outlined" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {attendance.checkOut !== '-' ? (
                    <Chip label={attendance.checkOut} size="small" variant="outlined" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{attendance.duration}</TableCell>
                <TableCell>
                  <Chip
                    //icon={getStatusIcon(attendance.status)}
                    label={getStatusLabel(attendance.status)}
                    color={getStatusColor(attendance.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAttendances.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Không tìm thấy dữ liệu điểm danh
          </Typography>
        </Box>
      )}

      {/* Camera Capture Dialog */}
      <CameraCapture
        open={cameraOpen}
        onClose={handleCloseCamera}
        onCapture={handleCapturePhoto}
      />
    </Box>
  );
}
