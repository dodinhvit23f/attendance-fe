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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { EmployeeDialog, EmployeeData, Facility } from '@/components/admin';

// Mock facilities data
const mockFacilities: Facility[] = [
  { id: 1, name: 'Văn phòng Hà Nội' },
  { id: 2, name: 'Chi nhánh Hồ Chí Minh' },
  { id: 3, name: 'Văn phòng Đà Nẵng' },
  { id: 4, name: 'Chi nhánh Cần Thơ' },
];

// Mock data
const mockEmployees = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    position: 'Nhân viên',
    department: 'Kỹ thuật',
    status: 'active',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    position: 'Quản lý',
    department: 'Kinh doanh',
    status: 'active',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    position: 'Nhân viên',
    department: 'Hành chính',
    status: 'inactive',
  },
];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeData | null>(null);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (id: number) => {
    const employee = mockEmployees.find((e) => e.id === id);
    if (employee) {
      // Map mock data to EmployeeData format
      setSelectedEmployee({
        id: employee.id,
        name: employee.name,
        phoneNumber: '0123456789', // Mock phone - replace with actual data
        email: employee.email,
        address: '123 Đường Láng, Đống Đa, Hà Nội', // Mock address - replace with actual data
        gender: 'male', // Mock gender - replace with actual data
        accountName: employee.email.split('@')[0],
        role: employee.position === 'Quản lý' ? 'manager' : 'employee',
        defaultPassword: '',
        facilityIds: [1, 2], // Mock facility IDs - replace with actual data
      });
      setDialogOpen(true);
    }
  };

  const handleDeleteEmployee = (id: number) => {
    console.log('Delete employee:', id);
    // TODO: Show confirmation dialog and delete
  };

  const handleSaveEmployee = (employeeData: EmployeeData) => {
    console.log('Save employee:', employeeData);
    // TODO: Add API call to save employee
    // If editing: PUT /api/employees/:id
    // If creating: POST /api/employees
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = mockEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Họ Tên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Chức Vụ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phòng Ban</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow
                key={employee.id}
                sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
              >
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    color={employee.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditEmployee(employee.id)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEmployees.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Không tìm thấy nhân viên nào
          </Typography>
        </Box>
      )}

      {/* Employee Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
        facilities={mockFacilities}
      />
    </Box>
  );
}
