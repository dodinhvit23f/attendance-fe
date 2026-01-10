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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCallback, useEffect, useState } from 'react';
import { useLoading } from '@/components/root/client-layout';
import { useNotify } from '@/components/notification/NotificationProvider';
import {
  getManagerUsers,
  type ManagerEmployee,
} from '@/lib/api/manager/users';
import { ErrorMessage } from '@/lib/constants';
import {getManagerFacilities, ManagerFacility} from "@/lib/api/manager/facilities";

export default function ManagerUsersPage() {
  const { setLoading } = useLoading();
  const { notifyError } = useNotify();
  const [employees, setEmployees] = useState<ManagerEmployee[]>([]);
  const [facilities, setFacilities] = useState<ManagerFacility[]>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<number[]>([]);

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getManagerFacilities();
        if (Array.isArray(response.data)) {
          setFacilities(response.data);
        } else {
          console.error('Invalid response format: data is not an array', response);
          setFacilities([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch facilities:', error);
        if (error instanceof Error) {
          const errorMessage = ErrorMessage.getMessage(
            error.message,
            'Không thể tải danh sách cơ sở'
          );
          notifyError(errorMessage);
        }
        setFacilities([]);
      }
    };

    fetchFacilities();
  }, [notifyError]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getManagerUsers({
        facilityIds: selectedFacilityIds.length > 0 ? selectedFacilityIds : undefined,
      });
      if (Array.isArray(response.data.employees)) {
        setEmployees(response.data.employees);
      } else {
        console.error('Invalid response format: employees is not an array', response);
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch employees:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(
          error.message,
          'Không thể tải danh sách nhân viên'
        );
        notifyError(errorMessage);
      }
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFacilityIds, setLoading, notifyError]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFacilityChange = (event: any) => {
    const value = event.target.value;
    setSelectedFacilityIds(typeof value === 'string' ? value.split(',').map(Number) : value);
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
          Quản Lý Nhân Viên
        </Typography>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Cơ sở</InputLabel>
          <Select
            multiple
            value={selectedFacilityIds}
            onChange={handleFacilityChange}
            input={<OutlinedInput label="Cơ sở" />}
            renderValue={(selected) =>
              facilities
                .filter((f) => selected.includes(f.id))
                .map((f) => f.name)
                .join(', ')
            }
            sx={{ borderRadius: '8px' }}
          >
            {facilities.map((facility) => (
              <MenuItem key={facility.id} value={facility.id}>
                <Checkbox checked={selectedFacilityIds.indexOf(facility.id) > -1} />
                <ListItemText primary={facility.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Employees Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Mã Nhân Viên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Họ Tên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Số Điện Thoại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giới Tính</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vai Trò</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ border: 0 }}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PersonAddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Chưa có nhân viên
                    </Typography>
                    <Typography color="text.secondary">
                      Không tìm thấy nhân viên nào trong hệ thống
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
                >
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phoneNumber}</TableCell>
                  <TableCell>
                    {employee.gender === 'MALE' ? 'Nam' : employee.gender === 'FEMALE' ? 'Nữ' : employee.gender}
                  </TableCell>
                  <TableCell>
                    <Chip label={employee.role} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.active ? 'Hoạt động' : 'Không hoạt động'}
                      color={employee.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}