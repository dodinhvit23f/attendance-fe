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
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { MapPicker } from './MapPicker';
import {useNotify} from "@/components/notification/NotificationProvider";
import { createFacility, updateFacility } from '@/lib/api/admin';

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
  allowedRadius?: number; // Allowed attendance range in meters
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
    allowedRadius: 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const {notifySuccess, notifyError} = useNotify();

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
        allowedRadius: 100,
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
    const allowedRadius = Number(formData.allowedRadius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Vĩ độ phải từ -90 đến 90';
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Kinh độ phải từ -180 đến 180';
    }

    if (isNaN(allowedRadius) || allowedRadius < 0 || allowedRadius > 150) {
      newErrors.allowedRadius = 'Khoảng cách chấm công hợp lý trong khoảng 10 - 150 mét';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const facilityData = {
        name: formData.name,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        allowDistance: formData.allowedRadius || 100,
      };

      if (facility?.id) {
        // Update existing facility
        await updateFacility(facility.id, facilityData);
        notifySuccess('Cập nhật cơ sở thành công!');
      } else {
        // Create new facility
        await createFacility(facilityData);
        notifySuccess('Tạo cơ sở thành công!');
      }

      onSave({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      handleClose();
    } catch (error: any) {
      notifyError(error.message || 'Có lỗi xảy ra khi lưu cơ sở');
    } finally {
      setIsSubmitting(false);
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
      allowedRadius: 100,
    });
    setErrors({});
    onClose();
  };


  const handleFindLocation = async () => {
    if (!formData.address.trim()) {
      setErrors((prev) => ({
        ...prev,
        address: 'Vui lòng nhập địa chỉ trước khi tìm kiếm',
      }));
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        }));
        // Clear any previous errors
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.latitude;
          delete newErrors.longitude;
          delete newErrors.address;
          return newErrors;
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          address: 'Không tìm thấy vị trí cho địa chỉ này. Vui lòng thử lại với địa chỉ khác.',
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setErrors((prev) => ({
        ...prev,
        address: 'Lỗi khi tìm kiếm vị trí. Vui lòng thử lại sau.',
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle location change from map click/drag
  const handleMapLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  // Calculate distance between two points using Haversine formula (in kilometers)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Get user's current GPS location
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      notifyError('Geolocation không được hỗ trợ trên trình duyệt này.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Calculate distance to facility
        const facilityLat = Number(formData.latitude);
        const facilityLng = Number(formData.longitude);
        if (facilityLat && facilityLng) {
          const dist = calculateDistance(latitude, longitude, facilityLat, facilityLng);
          setDistance(dist);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Không thể lấy vị trí của bạn.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian chờ.';
            break;
        }

        notifyError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Recalculate distance when facility location changes
  useEffect(() => {
    if (userLocation && formData.latitude && formData.longitude) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(formData.latitude),
        Number(formData.longitude)
      );
      setDistance(dist);
    }
  }, [formData.latitude, formData.longitude, userLocation]);

  // Auto-request user location when dialog opens
  // Note: Safari requires user gesture, so auto-request only works on Chrome/Firefox/Edge
  useEffect(() => {
    if (!open || userLocation) return;

    // Detect Safari (Safari blocks auto geolocation without user gesture)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isSafari) {
      // Auto-request for Chrome, Firefox, Edge, Brave, etc.
      handleGetMyLocation();
    }
    // Safari users will see a button to click
  }, [open]);

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

          {/* Address with Geocoding Button */}
          <TextField
            label="Địa Chỉ *"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={!!errors.address}
            helperText={
              errors.address ||
              'Nhập địa chỉ và nhấn 🔍 để tự động tìm tọa độ, hoặc nhấp vào bản đồ bên dưới'
            }
            placeholder="VD: 123 Đường Láng, Đống Đa, Hà Nội"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleFindLocation}
                      disabled={isGeocoding || !formData.address.trim()}
                      color="primary"
                      title="Tìm kiếm vị trí từ địa chỉ"
                    >
                      {isGeocoding ? <CircularProgress size={20} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
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

          {/* Allowed Attendance Radius */}
          <TextField
            label="Phạm Vi Điểm Danh (mét)"
            type="number"
            fullWidth
            value={formData.allowedRadius}
            onChange={(e) => handleChange('allowedRadius', Number(e.target.value))}
            error={!!errors.allowedRadius}
            helperText={errors.allowedRadius || 'Khoảng cách tối đa cho phép nhân viên điểm danh (mét)'}
            inputProps={{ min: 0, step: 10 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

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

          {/* Auto GPS Location and Distance Display */}
          <Box sx={{
            p: 2,
            bgcolor: 'primary.50',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  📍 Vị Trí Của Bạn {isGettingLocation && '(Đang tải...)'}
                </Typography>
                <Button
                  variant={userLocation ? "outlined" : "contained"}
                  size="small"
                  startIcon={isGettingLocation ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
                  onClick={handleGetMyLocation}
                  disabled={isGettingLocation}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none'
                  }}
                >
                  {isGettingLocation ? 'Đang lấy...' : userLocation ? 'Làm mới' : 'Lấy Vị Trí Của Tôi'}
                </Button>
              </Stack>

              {isGettingLocation && !userLocation && (
                <Typography variant="body2" color="text.secondary">
                  💡 Vui lòng cho phép truy cập vị trí khi trình duyệt hỏi
                </Typography>
              )}

              {userLocation && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tọa độ của bạn: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </Typography>

                  {distance !== null && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: 'success.50', borderRadius: '4px' }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 700 }}>
                          📏 Khoảng cách: {distance < 1
                            ? `${(distance * 1000).toFixed(0)} m`
                            : `${distance.toFixed(2)} km`}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Khoảng cách từ vị trí của bạn đến cơ sở này
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          {/* Interactive Map with Click-to-Pin */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <LocationOnIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Chọn Vị Trí Trên Bản Đồ (Nhấp hoặc Kéo Pin)
              </Typography>
            </Stack>
            <MapPicker
              latitude={Number(formData.latitude) || 21.0285}
              longitude={Number(formData.longitude) || 105.8542}
              onLocationChange={handleMapLocationChange}
              address={formData.address}
              userLocation={userLocation}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                🔴 Pin đỏ: Vị trí cơ sở
              </Typography>
              {userLocation && (
                <Typography variant="caption" color="primary">
                  🔵 Pin xanh: Vị trí của bạn
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💡 Mẹo: Nhấp vào bản đồ để đặt pin đỏ, hoặc kéo pin đến vị trí mong muốn.
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
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          {isSubmitting ? 'Đang lưu...' : (facility ? 'Cập Nhật' : 'Lưu')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
