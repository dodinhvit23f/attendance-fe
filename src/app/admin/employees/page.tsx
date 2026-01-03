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
  Button,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { CreateEmployeeDialog, UpdateEmployeeDialog, UpdateEmployeeData, Facility } from '@/components/admin';
import { useEffect } from 'react';
import { useLoading } from '@/components/root/client-layout';
import { getEmployees, Employee, updateEmployeeStatus } from '@/lib/api/admin/employees';
import { getRoles, type Role } from '@/lib/api/admin/roles';
import { FacilityLight, getFacilitiesLight } from '@/lib/api/admin/facilities';
import { useNotify } from '@/components/notification/NotificationProvider';
import { ErrorMessage } from '@/lib/constants';

// Mock facilities data
const mockFacilities: Facility[] = [
  { id: 1, name: 'Văn phòng Hà Nội' },
  { id: 2, name: 'Chi nhánh Hồ Chí Minh' },
  { id: 3, name: 'Văn phòng Đà Nẵng' },
  { id: 4, name: 'Chi nhánh Cần Thơ' },
];

export default function EmployeesPage() {
  const { setLoading } = useLoading();
  const { notifySuccess, notifyError } = useNotify();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<UpdateEmployeeData | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [facilities, setFacilities] = React.useState<FacilityLight[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalElements, setTotalElements] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [rolesLoaded, setRolesLoaded] = React.useState(false);
  const [facilitiesLoaded, setFacilitiesLoaded] = React.useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployees({
        page,
        size: rowsPerPage,
        tenant: 'attendance',
      });
      setEmployees(response.data.employees);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
        setRolesLoaded(true);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setRolesLoaded(true); // Set to true even on error to prevent infinite waiting
      }
    };

    if (!rolesLoaded) {
      fetchRoles();
    }
  }, [rolesLoaded]);

  // Step 2: Fetch facilities after roles are loaded
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getFacilitiesLight();
        setFacilities(response.data);
        setFacilitiesLoaded(true);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setFacilitiesLoaded(true); // Set to true even on error to prevent infinite waiting
      }
    };

    if (rolesLoaded && !facilitiesLoaded) {
      fetchFacilities();
    }
  }, [rolesLoaded, facilitiesLoaded]);

  // Step 3: Fetch employees after roles and facilities are loaded
  useEffect(() => {
    if (rolesLoaded && facilitiesLoaded) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, rolesLoaded, facilitiesLoaded]);


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
          emp.id === id ? { ...emp, active: newStatus } : emp
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

  const filteredEmployees = employees?.filter((employee) =>
    employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEmployee}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Thêm Nhân Viên
        </Button>
      </Stack>

      {/* Error Message */}
      {error && (
        <Box mb={3} sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
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
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      {/* Employee Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Mã NV</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Họ Tên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày Sinh</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Giới Tính</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vai Trò</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!employees || employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ border: 0 }}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Chưa có nhân viên nào
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Bắt đầu bằng cách thêm nhân viên đầu tiên
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddEmployee}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Thêm Nhân Viên
                    </Button>
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
                  <TableCell>{employee.dateOfBirth}</TableCell>
                  <TableCell>
                    {employee.gender === 'MALE' ? 'Nam' : employee.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </TableCell>
                  <TableCell>{getEmployeeRoleName(employee)}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch
                        checked={employee.active}
                        onChange={() => handleToggleStatus(employee.id, employee.active)}
                        color="success"
                        size="small"
                        disabled={togglingId === employee.id}
                      />
                      <Typography variant="body2" color="text.secondary">
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
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {/*<IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>*/}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trên tổng ${count !== -1 ? count : `nhiều hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Create Employee Dialog */}
      <CreateEmployeeDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onSave={handleSaveEmployee}
        roles={roles}
        facilities={facilities}
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
        />
      )}
    </Box>
  );
}
