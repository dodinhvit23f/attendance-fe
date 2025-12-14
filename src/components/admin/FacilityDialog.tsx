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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface FacilityDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (facility: FacilityData) => void;
  facility?: FacilityData | null;
}

export interface FacilityData {
  id?: number;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  latitude: number | string;
  longitude: number | string;
  capacity?: number;
}

export const FacilityDialog: React.FC<FacilityDialogProps> = ({
  open,
  onClose,
  onSave,
  facility,
}) => {
  const [formData, setFormData] = useState<FacilityData>({
    name: '',
    address: '',
    status: 'active',
    latitude: 21.0285,
    longitude: 105.8542,
    capacity: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when facility prop changes (for edit mode)
  useEffect(() => {
    if (facility) {
      setFormData(facility);
    } else {
      setFormData({
        name: '',
        address: '',
        status: 'active',
        latitude: 21.0285,
        longitude: 105.8542,
        capacity: 0,
      });
    }
  }, [facility, open]);

  const handleChange = (field: keyof FacilityData, value: any) => {
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

    if (!formData.name.trim()) {
      newErrors.name = 'Tên cơ sở là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Vĩ độ phải từ -90 đến 90';
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Kinh độ phải từ -180 đến 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      status: 'active',
      latitude: 21.0285,
      longitude: 105.8542,
      capacity: 0,
    });
    setErrors({});
    onClose();
  };

  // Generate Google Maps embed URL
  const getMapEmbedUrl = () => {
    const lat = Number(formData.latitude) || 21.0285;
    const lng = Number(formData.longitude) || 105.8542;
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
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
            {facility ? 'Chỉnh Sửa Cơ Sở' : 'Thêm Cơ Sở Mới'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Facility Name */}
          <TextField
            label="Tên Cơ Sở *"
            fullWidth
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="VD: Văn phòng Hà Nội"
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

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Trạng Thái</InputLabel>
            <Select
              value={formData.status}
              label="Trạng Thái"
              onChange={(e) => handleChange('status', e.target.value)}
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
            </Select>
          </FormControl>

          {/* Coordinates */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Vĩ Độ (Latitude) *"
              type="number"
              fullWidth
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              error={!!errors.latitude}
              helperText={errors.latitude || 'VD: 21.0285'}
              inputProps={{ step: 'any' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              label="Kinh Độ (Longitude) *"
              type="number"
              fullWidth
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              error={!!errors.longitude}
              helperText={errors.longitude || 'VD: 105.8542'}
              inputProps={{ step: 'any' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Stack>

          {/* Google Maps Embed */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <LocationOnIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Xem Trước Vị Trí Trên Bản Đồ
              </Typography>
            </Stack>
            <Box
              sx={{
                width: '100%',
                height: 300,
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid #E0E0E0',
              }}
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={getMapEmbedUrl()}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Bản đồ sẽ cập nhật tự động khi bạn thay đổi kinh độ và vĩ độ
            </Typography>
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
          {facility ? 'Cập Nhật' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
