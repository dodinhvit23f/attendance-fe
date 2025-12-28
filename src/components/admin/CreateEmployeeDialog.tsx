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
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import { createEmployee } from '@/lib/api/admin/employees';
import { type Role } from '@/lib/api/admin/roles';
import { FacilityLight } from '@/lib/api/admin/facilities';
import { useNotify } from '@/components/notification/NotificationProvider';

interface CreateEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  roles: Role[];
  facilities: FacilityLight[];
}

interface CreateEmployeeFormData {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  accountName: string;
  role: number;
  password: string;
  facilityIds: number[];
  active: boolean
}

export const CreateEmployeeDialog: React.FC<CreateEmployeeDialogProps> = ({
  open,
  onClose,
  onSave,
  roles,
  facilities,
}) => {
  const { notifyError } = useNotify();

  const [formData, setFormData] = useState<CreateEmployeeFormData>({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    accountName: '',
    role: roles.length > 0 ? roles[0].id : 0,
    password: '',
    facilityIds: [],
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        dateOfBirth: '',
        gender: 'male',
        accountName: '',
        role: roles.length > 0 ? roles[0].id : 0,
        password: '',
        facilityIds: [],
        active: true
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [open, roles]);

  const handleChange = (field: keyof CreateEmployeeFormData, value: any) => {
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

    // Account Information validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Tên tài khoản là bắt buộc';
    } else if (formData.accountName.length < 4) {
      newErrors.accountName = 'Tên tài khoản phải có ít nhất 4 ký tự';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.facilityIds.length === 0) {
      newErrors.facilityIds = 'Vui lòng chọn ít nhất một cơ sở làm việc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Find the role name from the role ID
      const selectedRole = roles.find((r) => r.id === formData.role);
      if (!selectedRole) {
        throw new Error('Vai trò không hợp lệ');
      }

      // Map gender to uppercase
      const genderMap = {
        male: 'MALE' as const,
        female: 'FEMALE' as const,
        other: 'OTHER' as const,
      };

      // Prepare the request data
      const requestData = {
        userName: formData.accountName,
        password: formData.password,
        role: selectedRole.name,
        facilityIds: formData.facilityIds,
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: genderMap[formData.gender],
      };

      // Call the API
      await createEmployee(requestData);

      // Call parent's onSave callback
      onSave();
      handleClose();
    } catch (error) {
      console.error('Failed to create employee:', error);
      // Show error notification
      notifyError(error instanceof Error ? error.message : 'Không thể tạo nhân viên');
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
      accountName: '',
      role: roles.length > 0 ? roles[0].id : 0,
      password: '',
      facilityIds: [],
      active: true
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
            Thêm Nhân Viên Mới
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
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
              <TextField
                label="Ngày Sinh *"
                type="date"
                fullWidth
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

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
                Thông Tin Tài Khoản
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2.5}>
              {/* Account Name */}
              <TextField
                label="Tên Tài Khoản *"
                fullWidth
                value={formData.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                error={!!errors.accountName}
                helperText={errors.accountName || 'Tối thiểu 4 ký tự'}
                placeholder="VD: nguyenvana"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

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
                    <MenuItem key={role.id} value={role.id}>
                      {convertRole(role.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Facilities Multi-Select */}
              <FormControl fullWidth error={!!errors.facilityIds}>
                <InputLabel>Cơ Sở Làm Việc *</InputLabel>
                <Select
                  multiple
                  value={formData.facilityIds}
                  label="Cơ Sở Làm Việc *"
                  onChange={(e) => handleChange('facilityIds', e.target.value)}
                  sx={{ borderRadius: '8px' }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const facility = facilities.find((f) => f.id === id);
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
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      <Checkbox checked={formData.facilityIds.indexOf(facility.id) > -1} />
                      <ListItemText primary={facility.name} />
                    </MenuItem>
                  ))}
                </Select>
                {errors.facilityIds && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.facilityIds}
                  </Typography>
                )}
              </FormControl>

              {/* Password */}
              <TextField
                label="Mật Khẩu Mặc Định *"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'Tối thiểu 6 ký tự'}
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
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};
