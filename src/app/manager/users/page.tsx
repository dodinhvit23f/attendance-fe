'use client';

import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {useLoading} from '@/components/root/client-layout';
import {useNotify} from '@/components/notification/NotificationProvider';
import {
  getManagerUsers,
  type ManagerEmployee,
  updateManagerEmployeeStatus,
} from '@/lib/api/manager/users';
import {ErrorMessage} from '@/lib/constants';
import {getManagerFacilities, ManagerFacility} from "@/lib/api/manager/facilities";

export default function ManagerUsersPage() {
  const {setLoading} = useLoading();
  const {notifyError, notifySuccess} = useNotify();
  const [employees, setEmployees] = useState<ManagerEmployee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState<number | null>(null);
  const [facilities, setFacilities] = useState<ManagerFacility[]>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<number[]>([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [totalElements, setTotalElements] = useState(0);

  const [togglingId, setTogglingId] = React.useState<number | null>(null);

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
        page,
        size: rowsPerPage,
        sort: 'id,desc',
      });
      if (Array.isArray(response.data.employees)) {
        setEmployees(response.data.employees);
        setTotalElements(response.data.totalElements);
      } else {
        console.error('Invalid response format: employees is not an array', response);
        setEmployees([]);
        setTotalElements(0);
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
      setTotalElements(0);
    } finally {
      setLoading(false);
      setIsLoadingEmployees(false)
    }
  }, [selectedFacilityIds, page, rowsPerPage, setLoading, notifyError]);

  useEffect(() => {
    if (isLoadingEmployees) {
      fetchEmployees();
    }
  }, [isLoadingEmployees]);

  const handleFacilityChange = (event: any) => {
    const value = event.target.value;
    setSelectedFacilityIds(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (employee: ManagerEmployee) => {
    setUpdatingEmployeeId(employee.id);
    try {
      setTogglingId(employee.id);

      await updateManagerEmployeeStatus(employee.id, employee.version);
      setEmployees((prev) =>
          prev.map((emp) =>
              emp.id === employee.id
                  ? {...emp, active: !emp.active, version: emp.version + 1}
                  : emp
          )
      );
      notifySuccess('Cập nhật trạng thái thành công!');
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(
            error.message,
            'Không thể cập nhật trạng thái'
        );
        notifyError(errorMessage);
      }
    } finally {
      setUpdatingEmployeeId(null);
      setTogglingId(null);
    }
  };

  return (
      <Box sx={{width: '100%', p: 3}}>
        {/* Header */}
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
        >
          <Typography variant="h4" component="h1" sx={{fontWeight: 600}}>
            Quản Lý Nhân Viên
          </Typography>
        </Stack>

        {/* Filters */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <FormControl sx={{minWidth: 250}}>
            <InputLabel>Cơ sở</InputLabel>
            <Select
                multiple
                value={selectedFacilityIds}
                onChange={handleFacilityChange}
                input={<OutlinedInput label="Cơ sở"/>}
                renderValue={(selected) =>
                    facilities
                    .filter((f) => selected.includes(f.id))
                    .map((f) => f.name)
                    .join(', ')
                }
                sx={{borderRadius: '8px'}}
            >
              {facilities.map((facility) => (
                  <MenuItem key={facility.id} value={facility.id}>
                    <Checkbox checked={selectedFacilityIds.indexOf(facility.id) > -1}/>
                    <ListItemText primary={facility.name}/>
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Employees Table */}
        <Box sx={{
          height: 'calc(100vh - 280px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{backgroundColor: '#F5F5F5'}}>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Mã Nhân Viên</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Họ Tên</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Email</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Số Điện Thoại</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Giới Tính</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Vai Trò</TableCell>
                  <TableCell sx={{fontWeight: 600, backgroundColor: '#F5F5F5'}}>Trạng Thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{border: 0}}>
                        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8}}>
                          <CircularProgress size={40} sx={{mr: 2}} />
                          <Typography variant="body1" color="text.secondary">
                            Đang tải dữ liệu...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{border: 0}}>
                        <Box sx={{textAlign: 'center', py: 8}}>
                          <PersonAddIcon sx={{fontSize: 64, color: 'text.secondary', mb: 2}}/>
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
                            sx={{'&:hover': {backgroundColor: '#F9F9F9'}}}
                        >
                          <TableCell>{employee.employeeId}</TableCell>
                          <TableCell
                            title={employee.fullName}
                            sx={{
                              maxWidth: {xs: 100, sm: 150, md: 200},
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.fullName}
                          </TableCell>
                          <TableCell
                            title={employee.email}
                            sx={{
                              maxWidth: {xs: 120, sm: 180, md: 250},
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.email}
                          </TableCell>
                          <TableCell
                            title={employee.phoneNumber}
                            sx={{
                              maxWidth: {xs: 90, sm: 120, md: 150},
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.phoneNumber}
                          </TableCell>
                          <TableCell>
                            {employee.gender === 'MALE' ? 'Nam' : employee.gender === 'FEMALE' ? 'Nữ' : employee.gender}
                          </TableCell>
                          <TableCell>
                            <Chip label={employee.role} size="small" color="primary"
                                  variant="outlined"/>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Switch
                                  size="small"
                                  checked={employee.active}
                                  onChange={() => handleToggleStatus(employee)}
                                  disabled={updatingEmployeeId === employee.id}
                              />
                              <Typography variant="body2" color="text.secondary"
                                          sx={{fontSize: {xs: '0.75rem', sm: '0.875rem'}}}>
                                {togglingId === employee.id ? 'Đang cập nhật...' : (employee.active ? 'Hoạt động' : 'Ngừng hoạt động')}
                              </Typography>
                            </Stack>
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
      </Box>
  );
}