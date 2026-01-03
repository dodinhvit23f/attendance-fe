'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
  InputAdornment,
  Checkbox,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import { updateEmployee, getEmployee } from '@/lib/api/admin/employees';
import { type Role } from '@/lib/api/admin/roles';
import { FacilityLight } from '@/lib/api/admin/facilities';
import { useNotify } from '@/components/notification/NotificationProvider';

export interface UpdateEmployeeData {
  id: number
  employeeId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  role: number;
  facilityIds: number[];
}

interface UpdateEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: UpdateEmployeeData;
  roles: Role[];
  facilities: FacilityLight[];
}

interface UpdateEmployeeFormData {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  role: string;
  facilityIds: number[];
  password: string;
}

export const UpdateEmployeeDialog: React.FC<UpdateEmployeeDialogProps> = ({
  open,
  onClose,
  onSave,
  employee,
  roles,
  facilities,
}) => {
  const { notifyError, notifySuccess } = useNotify();

  const [formData, setFormData] = useState<UpdateEmployeeFormData>({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    role: '',
    facilityIds: [],
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployee, setFetchingEmployee] = useState(false);

  // Fetch employee data when dialog opens
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (open && employee?.employeeId) {
        setFetchingEmployee(true);
        try {
          const response = await getEmployee(employee.employeeId);
          const employeeData = response.data;

          // Convert gender from uppercase to lowercase
          const genderMap: Record<string, 'male' | 'female' | 'other'> = {
            MALE: 'male',
            FEMALE: 'female',
            OTHER: 'other',
          };
          const gender = genderMap[employeeData.gender] || 'male';

          // Extract facility IDs from facilities array (optional)
          const facilityIds = employeeData.facilities?.map((f) => f.id) || [];

          setFormData({
            name: employeeData.fullName,
            phoneNumber: employeeData.phoneNumber,
            email: employeeData.email,
            address: employeeData.address,
            dateOfBirth: employeeData.dateOfBirth,
            gender,
            role: employeeData.role,
            facilityIds,
            password: '',
          });
          setErrors({});
          setShowPassword(false);
        } catch (error) {
          console.error('Failed to fetch employee data:', error);
          notifyError('Không thể tải thông tin nhân viên');
        } finally {
          setFetchingEmployee(false);
        }
      }
    };

    fetchEmployeeData();
  }, [open, employee?.employeeId, notifyError]);

  const handleChange = (field: keyof UpdateEmployeeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information validation
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Password validation (optional but must meet requirements if provided)
    if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Facilities are optional, no validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Map gender to uppercase
      const genderMap = {
        male: 'MALE' as const,
        female: 'FEMALE' as const,
        other: 'OTHER' as const,
      };

      // Prepare the request data (same format as create employee)
      const requestData: any = {
        role: formData.role,
        facilityIds: formData.facilityIds,
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: genderMap[formData.gender],
      };

      // Only include password if it was provided
      if (formData.password.trim()) {
        requestData.password = formData.password;
      }

      // Call the API PUT /admin/v1/employees/{id}
      await updateEmployee(employee.id, requestData);

      // Show success message
      notifySuccess('Cập nhật nhân viên thành công!');

      // Call parent's onSave callback
      onSave();
      handleClose();
    } catch (error) {
      console.error('Failed to update employee:', error);
      // Show error notification
      notifyError(error instanceof Error ? error.message : 'Không thể cập nhật nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      dateOfBirth: '',
      gender: 'male',
      role: '',
      facilityIds: [],
      password: '',
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  const convertRole = (s: string) => {
    if (s === 'MANAGER') {
      return 'Quản Lý';
    }

    if (s === 'FLORIST') {
      return 'Thợ Hoa';
    }

    if (s === 'SALE') {
      return 'Nhân Viên Kinh Doanh';
    }

    return 'Nhân Viên';
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
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chỉnh Sửa Nhân Viên
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {fetchingEmployee ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Personal Information Section */}
            <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Thông Tin Cá Nhân
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              {/* Name */}
              <TextField
                label="Họ Tên *"
                fullWidth
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="VD: Nguyễn Văn A"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Phone Number */}
              <TextField
                label="Số Điện Thoại *"
                fullWidth
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                placeholder="VD: 0123456789"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Email */}
              <TextField
                label="Email *"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="VD: nguyenvana@example.com"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Date of Birth */}
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                  label="Ngày Sinh *"
                  value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                  onChange={(newValue) => {
                    handleChange('dateOfBirth', newValue ? newValue.format('YYYY-MM-DD') : '');
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Address */}
              <TextField
                label="Địa Chỉ *"
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                placeholder="VD: 123 Đường Láng, Đống Đa, Hà Nội"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {/* Gender */}
              <FormControl fullWidth>
                <InputLabel>Giới Tính *</InputLabel>
                <Select
                  value={formData.gender}
                  label="Giới Tính *"
                  onChange={(e) => handleChange('gender', e.target.value)}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Account Information Section */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <AccountCircleIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Thông Tin Tài Khoản {formData.role}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              {/* Role */}
              <FormControl fullWidth>
                <InputLabel>Vai Trò *</InputLabel>
                <Select
                  value={formData.role}
                  label="Vai Trò *"
                  onChange={(e) => handleChange('role', e.target.value)}
                  sx={{ borderRadius: '8px' }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.name} value={role.name}>
                      {convertRole(role.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Facilities Multi-Select */}
              <FormControl fullWidth>
                <InputLabel>Cơ Sở Làm Việc</InputLabel>
                <Select
                  multiple
                  value={formData.facilityIds}
                  label="Cơ Sở Làm Việc"
                  onChange={(e) => handleChange('facilityIds', e.target.value)}
                  sx={{ borderRadius: '8px' }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const facility = facilities?.find((f) => f.id === id);
                        return (
                          <Chip
                            key={id}
                            label={facility?.name}
                            size="small"
                            icon={<BusinessIcon />}
                            sx={{ borderRadius: '6px' }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {facilities?.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      <Checkbox checked={formData.facilityIds.indexOf(facility.id) > -1} />
                      <ListItemText primary={facility.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Password (optional) */}
              <TextField
                label="Mật Khẩu Mới (để trống nếu không đổi)"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'Tối thiểu 6 ký tự nếu muốn thay đổi'}
                placeholder="••••••••"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Cập Nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};
