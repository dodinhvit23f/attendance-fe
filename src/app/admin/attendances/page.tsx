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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

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
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Quản Lý Chấm Công
      </Typography>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          placeholder="Tìm kiếm theo tên nhân viên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
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
                    icon={getStatusIcon(attendance.status)}
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
    </Box>
  );
}
