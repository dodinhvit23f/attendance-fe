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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';

export interface Facility {
  id: number;
  name: string;
}

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: EmployeeData) => void;
  employee?: EmployeeData | null;
  facilities: Facility[];
}

export interface EmployeeData {
  id?: number;
  // Personal Information
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  // Account Information
  accountName: string;
  role: 'admin' | 'employee' | 'manager';
  defaultPassword: string;
  facilityIds: number[];
}

export const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onClose,
  onSave,
  employee,
  facilities,
}) => {
  const [formData, setFormData] = useState<EmployeeData>({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    gender: 'male',
    accountName: '',
    role: 'employee',
    defaultPassword: '',
    facilityIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Update form data when employee prop changes (for edit mode)
  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        gender: 'male',
        accountName: '',
        role: 'employee',
        defaultPassword: '',
        facilityIds: [],
      });
    }
  }, [employee, open]);

  const handleChange = (field: keyof EmployeeData, value: any) => {
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

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Account Information validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Tên tài khoản là bắt buộc';
    } else if (formData.accountName.length < 4) {
      newErrors.accountName = 'Tên tài khoản phải có ít nhất 4 ký tự';
    }

    if (!employee && !formData.defaultPassword.trim()) {
      newErrors.defaultPassword = 'Mật khẩu là bắt buộc';
    } else if (!employee && formData.defaultPassword.length < 6) {
      newErrors.defaultPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
      gender: 'male',
      accountName: '',
      role: 'employee',
      defaultPassword: '',
      facilityIds: [],
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {employee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
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
                  <MenuItem value="employee">Nhân Viên</MenuItem>
                  <MenuItem value="manager">Quản Lý</MenuItem>
                  <MenuItem value="admin">Quản Trị Viên</MenuItem>
                </Select>
              </FormControl>

              {/* Facilities Multi-Select */}
              <FormControl fullWidth>
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
              </FormControl>

              {/* Default Password */}
              <TextField
                label={employee ? 'Mật Khẩu Mới (để trống nếu không đổi)' : 'Mật Khẩu Mặc Định *'}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={formData.defaultPassword}
                onChange={(e) => handleChange('defaultPassword', e.target.value)}
                error={!!errors.defaultPassword}
                helperText={errors.defaultPassword || 'Tối thiểu 6 ký tự'}
                placeholder="••••••••"
                InputProps={{
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
          startIcon={<SaveIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          {employee ? 'Cập Nhật' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
