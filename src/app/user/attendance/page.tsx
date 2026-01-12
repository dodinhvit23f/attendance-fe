'use client';

import React, { useState, useEffect } from 'react';
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
  TextField,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLoading } from '@/components/root/client-layout';

interface AttendanceRecord {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'present' | 'absent' | 'late';
  location: string;
}

// Mock data - replace with actual API call
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: 1,
    date: '2024-12-28',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    status: 'present',
    location: 'Văn phòng Hà Nội',
  },
  {
    id: 2,
    date: '2024-12-27',
    checkInTime: '08:15',
    checkOutTime: '17:05',
    status: 'late',
    location: 'Văn phòng Hà Nội',
  },
  {
    id: 3,
    date: '2024-12-26',
    checkInTime: '-',
    checkOutTime: '-',
    status: 'absent',
    location: '-',
  },
];

export default function UserAttendancePage() {
  const { setLoading } = useLoading();

  // Get today and tomorrow as default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(tomorrow));
  const [dateError, setDateError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(mockAttendanceData);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Validate date range
  useEffect(() => {
    validateDateRange();
  }, [startDate, endDate]);

  const validateDateRange = () => {
    if (!startDate || !endDate) {
      setDateError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if start date is before end date
    if (start >= end) {
      setDateError('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return false;
    }

    // Check if range is within 1 month (30 days)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      setDateError('Khoảng thời gian không được vượt quá 1 tháng (30 ngày)');
      return false;
    }

    setDateError(null);
    return true;
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Có mặt"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'late':
        return (
          <Chip
            label="Đi muộn"
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'absent':
        return (
          <Chip
            icon={<CancelIcon />}
            label="Vắng mặt"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return null;
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Lịch Sử Chấm Công
      </Typography>

      {/* Date Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }} elevation={2}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Lọc Theo Ngày
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Ngày bắt đầu"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <TextField
            label="Ngày kết thúc"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Stack>

        {dateError && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            {dateError}
          </Alert>
        )}

        {!dateError && (
          <Alert severity="info" sx={{ borderRadius: '8px' }}>
            Hiển thị dữ liệu từ {formatDateDisplay(startDate)} đến {formatDateDisplay(endDate)}
          </Alert>
        )}
      </Paper>

      {/* Attendance Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giờ Vào</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giờ Ra</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Địa Điểm</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.length > 0 ? (
              attendanceData.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
                >
                  <TableCell>{formatDateDisplay(record.date)}</TableCell>
                  <TableCell>{record.checkInTime}</TableCell>
                  <TableCell>{record.checkOutTime}</TableCell>
                  <TableCell>{getStatusChip(record.status)}</TableCell>
                  <TableCell>{record.location}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Không có dữ liệu chấm công trong khoảng thời gian này
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
