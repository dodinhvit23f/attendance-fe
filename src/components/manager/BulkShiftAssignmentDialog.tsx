'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getEmployeesForShiftAssignment, EmployeeShiftAssignment, Shift, bulkAssignShifts } from '@/lib/api/manager/shifts';
import { ErrorMessage } from '@/lib/constants';
import { useNotify } from '@/components/notification/NotificationProvider';
import { useLoading } from '@/components/root/client-layout';
import {formatDateWithTimezone} from "@/lib/api/types";

interface BulkShiftAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  shifts: Shift[];
}

export function BulkShiftAssignmentDialog({
  open,
  onClose,
  shifts,
}: BulkShiftAssignmentDialogProps) {
  const { notifyError, notifySuccess } = useNotify();
  const { setLoading } = useLoading();

  const [selectedAssignDate, setSelectedAssignDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [bulkAssignCalendarDate, setBulkAssignCalendarDate] = useState<dayjs.Dayjs | null>(dayjs().add(1, 'day'));
  const [employeesForAssignment, setEmployeesForAssignment] = useState<EmployeeShiftAssignment[]>([]);
  const [assignPage, setAssignPage] = useState(0);
  const [assignRowsPerPage, setAssignRowsPerPage] = useState(20);
  const [assignTotalElements, setAssignTotalElements] = useState(0);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeeShiftChanges, setEmployeeShiftChanges] = useState<Record<number, number>>({});

  const fetchEmployeesForAssignment = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await getEmployeesForShiftAssignment({
        assignDate: selectedAssignDate,
        page: assignPage,
        size: assignRowsPerPage,
      });
      if (response.data?.employees) {
        setEmployeesForAssignment(response.data.employees);
        setAssignTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch employees for assignment:', error);
      notifyError('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [selectedAssignDate, assignPage, assignRowsPerPage, notifyError]);

  useEffect(() => {
    if (open) {
      fetchEmployeesForAssignment();
    }
  }, [open, fetchEmployeesForAssignment]);

  const handleClose = () => {
    setEmployeesForAssignment([]);
    setEmployeeShiftChanges({});
    setAssignPage(0);
    setBulkAssignCalendarDate(dayjs().add(1, 'day'));
    setSelectedAssignDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
    onClose();
  };

  const handleCalendarDateChange = (newDate: dayjs.Dayjs | null) => {
    if (newDate) {
      setBulkAssignCalendarDate(newDate);
      setSelectedAssignDate(newDate.format('YYYY-MM-DD'));
      setAssignPage(0);
    }
  };

  const handleEmployeeShiftChange = (userId: number, shiftId: number) => {
    setEmployeeShiftChanges((prev) => {
      const updated = { ...prev };
      updated[userId] = shiftId;
      return updated;
    });
  };

  const getEmployeeShiftValue = (employee: EmployeeShiftAssignment): number | string => {
    // Check if user has made a change for this specific employee
    if (employeeShiftChanges[employee.userId] !== undefined) {
      return employeeShiftChanges[employee.userId];
    }
    // Otherwise show current shift or empty
    return employee.shiftId || '';
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setAssignPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssignRowsPerPage(parseInt(event.target.value, 10));
    setAssignPage(0);
  };

  const handleSubmit = async () => {
    if (Object.keys(employeeShiftChanges).length === 0) {
      notifyError('Vui lòng chọn ca cho ít nhất một nhân viên');
      return;
    }

    try {
      setLoading(true);
      const assignments = Object.entries(employeeShiftChanges).map(([userId, shiftId]) => ({
        userId: Number(userId),
        shiftId,
      }));

      await bulkAssignShifts({
        assignDate: formatDateWithTimezone(selectedAssignDate),
        assignments,
      });

      notifySuccess('Phân ca thành công!');
      handleClose();
    } catch (error: unknown) {
      console.error('Failed to bulk assign shifts:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể phân ca');
        notifyError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getShiftName = (shiftId: number | undefined) => {
    if (!shiftId) return null;
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || null;
  };

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
      <DialogTitle sx={{ fontWeight: 600 }}>
        Phân Ca Hàng Loạt
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Chọn ngày phân ca:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={bulkAssignCalendarDate}
              onChange={handleCalendarDateChange}
              minDate={dayjs().add(1, 'day')}
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
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Chỉ có thể chọn ngày trong tương lai
          </Typography>
        </Box>

        {isLoadingEmployees ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ mr: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Đang tải dữ liệu...
            </Typography>
          </Box>
        ) : employeesForAssignment.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không có nhân viên nào
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={1}
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                mb: 2,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>Tên đăng nhập</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>Họ và tên</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>Ca hiện tại</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>Chọn ca mới</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeesForAssignment.map((employee, index) => (
                    <TableRow key={employee.userId}>
                      <TableCell>{employee.userName}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>
                        {employee.shiftId ? (
                          <Chip
                            label={getShiftName(employee.shiftId) || `Ca ${employee.shiftId}`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa phân ca
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={getEmployeeShiftValue(employee)}
                            onChange={(e) => handleEmployeeShiftChange(employee.userId, e.target.value as number)}
                            displayEmpty
                            sx={{ borderRadius: '8px' }}
                          >
                            <MenuItem value="" disabled>
                              Chọn ca
                            </MenuItem>
                            {shifts.filter(s => s.isActive).map((shift) => (
                              <MenuItem key={shift.id} value={shift.id}>
                                {shift.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[20, 50, 100]}
              component="div"
              count={assignTotalElements}
              rowsPerPage={assignRowsPerPage}
              page={assignPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({from, to, count}) =>
                `${from}-${to} trên tổng ${count !== -1 ? count : `nhiều hơn ${to}`}`
              }
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={Object.keys(employeeShiftChanges).length === 0 || isLoadingEmployees}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          Xác Nhận Phân Ca
        </Button>
      </DialogActions>
    </Dialog>
  );
}
