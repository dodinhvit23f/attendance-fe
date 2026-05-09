'use client';

import * as React from 'react';
import {useEffect} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {CreateEmployeeDialog, UpdateEmployeeData, UpdateEmployeeDialog} from '@/components/admin';
import {useLoading} from '@/components/root/client-layout';
import {Employee, getEmployees, updateEmployeeStatus} from '@/lib/api/admin/employees';
import {getRoles, type Role} from '@/lib/api/admin/roles';
import {FacilityLight, getFacilitiesLight} from '@/lib/api/admin/facilities';
import {getShifts, type Shift} from '@/lib/api/admin/shifts';
import {useNotify} from '@/components/notification/NotificationProvider';
import {ErrorMessage} from '@/lib/constants';

export default function EmployeesPage() {
  const {setLoading} = useLoading();
  const {notifySuccess, notifyError} = useNotify();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<UpdateEmployeeData | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [facilities, setFacilities] = React.useState<FacilityLight[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(30);
  const [totalElements, setTotalElements] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [dependenciesLoaded, setDependenciesLoaded] = React.useState(false);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setLoading(true);
      setError(null);
      const response = await getEmployees({
        page,
        size: rowsPerPage,
        tenant: 'attendance',
      });
      setEmployees(response.data.employees);
      setTotalElements(response.data.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const loadDependencies = async () => {
      const [rolesRes, facilitiesRes, shiftsRes] = await Promise.allSettled([
        getRoles(),
        getFacilitiesLight(),
        getShifts(),
      ]);
      if (cancelled) return;
      if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value.data);
      if (facilitiesRes.status === 'fulfilled') setFacilities(facilitiesRes.value.data);
      if (shiftsRes.status === 'fulfilled') setShifts(shiftsRes.value.data.shifts || []);
      setDependenciesLoaded(true);
    };
    loadDependencies();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (dependenciesLoaded) {
      fetchEmployees();
    }
  }, [page, rowsPerPage, dependenciesLoaded]);

  const filteredEmployees = React.useMemo(() => {
    if (!debouncedQuery) return employees;
    return employees.filter((e) =>
      e.fullName.toLowerCase().includes(debouncedQuery) ||
      e.email.toLowerCase().includes(debouncedQuery) ||
      e.employeeId.toLowerCase().includes(debouncedQuery)
    );
  }, [employees, debouncedQuery]);


  const handleAddEmployee = () => {
    setCreateDialogOpen(true);
  };

  const handleEditEmployee = (id: number) => {
    const employee = employees.find((e) => e.id === id);
    if (employee) {
      // Find the role ID from the role name
      const roleData = roles.find((r) => r.name === employee.role);
      const roleId = roleData ? roleData.id : 0;

      // Map API data to UpdateEmployeeData format
      setSelectedEmployee({
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.fullName,
        phoneNumber: employee.phoneNumber,
        email: employee.email,
        address: employee.address,
        dateOfBirth: employee.dateOfBirth,
        gender: employee.gender.toLowerCase() as 'male' | 'female' | 'other',
        role: roleId,
        facilityIds: [],
      });
      setUpdateDialogOpen(true);
    }
  };

  const handleSaveEmployee = () => {
    // Reload employee list after save
    fetchEmployees();
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;

    const newStatus = !currentStatus;
    setTogglingId(id);

    try {
      // Call API to update employee status
      await updateEmployeeStatus(id, newStatus, employee.version);

      // Update local state
      setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
              emp.id === id ? {...emp, active: newStatus, version: employee.version + 1} : emp
          )
      );

      notifySuccess('Cập nhật trạng thái thành công!');
    } catch (err: any) {
      console.error('Error updating employee status:', err);
      if (err instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(err.message, 'Có lỗi xảy ra khi cập nhật trạng thái');
        notifyError(errorMessage);
      }
      // Reload to get correct state from server
      fetchEmployees();
    } finally {
      setTogglingId(null);
    }
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEmployeeRoleName = (employee: Employee) => {
    switch (employee.role) {
      case "MANAGER":
        return "Quản Lý"
      case "FLORIST":
        return "Thợ Hoa"
      case "SALE":
        return "Kinh Doanh"
      default:
        return "Nhân Viên"
    }
  }

  const getShiftName = (employee: Employee) => {

    if (employee.shiftId) {
      return shifts.find(shift => shift.id === employee.shiftId)?.name
    }

    return "Chưa Phân Ca"
  }

  return (
      <Box sx={{width: '100%', p: { xs: 1.5, sm: 2, md: 3 }}}>
        {/* Header */}
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={3}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            Quản Lý Nhân Viên
          </Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon/>}
              onClick={handleAddEmployee}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                width: { xs: '100%', sm: 'auto' }
              }}
          >
            Thêm Nhân Viên
          </Button>
        </Stack>

        {/* Error Message */}
        {error && (
            <Box mb={3} sx={{p: 2, bgcolor: 'error.light', borderRadius: 1}}>
              <Typography color="error.dark">{error}</Typography>
            </Box>
        )}

        {/* Search Bar */}
        <Box mb={3}>
          <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon/>
                      </InputAdornment>
                  ),
                },
              }}
              sx={{
                maxWidth: { xs: '100%', sm: 500 },
              }}
          />
        </Box>

        {/* Employee Table */}
        <Box sx={{
          height: { xs: 'auto', md: 'calc(100vh - 320px)' },
          minHeight: { xs: 400, md: 'auto' },
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
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, backgroundColor: '#F5F5F5'}}>Mã NV</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, backgroundColor: '#F5F5F5'}}>Họ Tên</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' }, backgroundColor: '#F5F5F5'}}>Email</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' }, backgroundColor: '#F5F5F5'}}>Ngày Sinh</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' }, backgroundColor: '#F5F5F5'}}>Giới Tính</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, backgroundColor: '#F5F5F5'}}>Ca Làm</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, backgroundColor: '#F5F5F5'}}>Vai Trò</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' }, backgroundColor: '#F5F5F5'}}>Trạng Thái</TableCell>
                  <TableCell sx={{fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, backgroundColor: '#F5F5F5'}} align="right">
                    Thao Tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{border: 0}}>
                        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8}}>
                          <CircularProgress size={40} sx={{mr: 2}} />
                          <Typography variant="body1" color="text.secondary">
                            Đang tải dữ liệu...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                ) : !filteredEmployees || filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{border: 0}}>
                        <Box sx={{textAlign: 'center', py: 8}}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {debouncedQuery ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}
                          </Typography>
                          {!debouncedQuery && (
                            <>
                              <Typography color="text.secondary" sx={{mb: 2}}>
                                Bắt đầu bằng cách thêm nhân viên đầu tiên
                              </Typography>
                              <Button
                                  variant="contained"
                                  startIcon={<AddIcon/>}
                                  onClick={handleAddEmployee}
                                  sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }}
                              >
                                Thêm Nhân Viên
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                ) : (
                    filteredEmployees.map((employee) => (
                        <TableRow
                            key={employee.id}
                            sx={{'&:hover': {backgroundColor: '#F9F9F9'}}}
                        >
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}>{employee.employeeId}</TableCell>
                          <TableCell
                            title={employee.fullName}
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              display: { xs: 'none', md: 'table-cell' },
                              maxWidth: {xs: 120, sm: 180, md: 250},
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.email}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' }}}>{employee.dateOfBirth}</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' }}}>
                            {employee.gender === 'MALE' ? 'Nam' : employee.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}>{getShiftName(employee)}</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}>{getEmployeeRoleName(employee)}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }}}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Switch
                                  checked={employee.active}
                                  onChange={() => handleToggleStatus(employee.id, employee.active)}
                                  color="success"
                                  size="small"
                                  disabled={togglingId === employee.id}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}>
                                {togglingId === employee.id ? 'Đang cập nhật...' : (employee.active ? 'Hoạt động' : 'Ngừng hoạt động')}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditEmployee(employee.id)}
                            >
                              <EditIcon fontSize="small"/>
                            </IconButton>
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

        {/* Create Employee Dialog */}
        <CreateEmployeeDialog
            open={createDialogOpen}
            onClose={handleCloseCreateDialog}
            onSave={handleSaveEmployee}
            roles={roles}
            facilities={facilities}
            shifts={shifts}
        />

        {/* Update Employee Dialog */}
        {selectedEmployee && (
            <UpdateEmployeeDialog
                open={updateDialogOpen}
                onClose={handleCloseUpdateDialog}
                onSave={handleSaveEmployee}
                employee={selectedEmployee}
                roles={roles}
                facilities={facilities}
                shifts={shifts}
            />
        )}
      </Box>
  );
}
