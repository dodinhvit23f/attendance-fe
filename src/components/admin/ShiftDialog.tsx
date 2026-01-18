'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useNotify} from '@/components/notification/NotificationProvider';
import {
  createShift,
  getShifts,
  type Shift,
  updateShift,
  updateShiftStatus,
} from '@/lib/api/admin/shifts';
import {ErrorMessage} from '@/lib/constants';

interface ShiftDialogProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

interface ShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
}

const formatTimeForDisplay = (time: string): string => {
  // Convert HH:mm:ss to HH:mm for display
  return time.substring(0, 5);
};

const formatTimeForApi = (time: string): string => {
  // Convert HH:mm to HH:mm:ss for API
  return time.length === 5 ? `${time}:00` : time;
};

export const ShiftDialog: React.FC<ShiftDialogProps> = ({open, onClose}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<ShiftFormData>({
    name: '',
    startTime: '08:00',
    endTime: '18:00',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const {notifySuccess, notifyError} = useNotify();

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getShifts();
      setShifts(response.data.shifts || []);
    } catch (error: any) {
      console.error('Failed to fetch shifts:', error);
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(
            error.message,
            'Không thể tải danh sách ca làm việc'
        );
        notifyError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchShifts();
      setViewMode('list');
      resetForm();
    }
  }, [open, fetchShifts]);

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
    });
    setErrors({});
    setSelectedShift(null);
  };

  const handleChange = (field: keyof ShiftFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên ca làm việc là bắt buộc';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Giờ bắt đầu là bắt buộc';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Giờ kết thúc là bắt buộc';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const shiftData = {
        name: formData.name,
        startTime: formatTimeForApi(formData.startTime),
        endTime: formatTimeForApi(formData.endTime),
      };

      if (viewMode === 'edit' && selectedShift) {
        await updateShift(selectedShift.id, shiftData);
        notifySuccess('Cập nhật ca làm việc thành công!');
      } else {
        await createShift(shiftData);
        notifySuccess('Tạo ca làm việc thành công!');
      }

      await fetchShifts();
      setViewMode('list');
      resetForm();
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(
            error.message,
            'Có lỗi xảy ra khi lưu ca làm việc'
        );
        notifyError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (shift: Shift) => {
    setStatusUpdating(shift.id);
    try {
      await updateShiftStatus(shift.id, !shift.isActive);
      notifySuccess(
          `${shift.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} ca làm việc thành công!`
      );
      await fetchShifts();
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(
            error.message,
            'Không thể cập nhật trạng thái ca làm việc'
        );
        notifyError(errorMessage);
      }
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      name: shift.name,
      startTime: formatTimeForDisplay(shift.startTime),
      endTime: formatTimeForDisplay(shift.endTime),
    });
    setViewMode('edit');
  };

  const handleCreate = () => {
    // Find the latest end time from existing shifts
    let latestEndTime = '09:00';
    if (shifts.length > 0) {
      const sortedShifts = [...shifts].sort((a, b) =>
          a.endTime.localeCompare(b.endTime)
      );
      const latestShift = sortedShifts[sortedShifts.length - 1];
      latestEndTime = formatTimeForDisplay(latestShift.endTime);
    }

    setFormData({
      name: '',
      startTime: latestEndTime,
      endTime: '18:00',
    });
    setErrors({});
    setSelectedShift(null);
    setViewMode('create');
  };

  const handleBack = () => {
    setViewMode('list');
    resetForm();
  };

  const handleClose = () => {
    setViewMode('list');
    resetForm();
    onClose();
  };

  const renderListView = () => (
      <>
        <DialogTitle sx={{pb: 1}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{fontWeight: 600}}>
              Quản Lý Ca Làm Việc
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                  variant="contained"
                  startIcon={<AddIcon/>}
                  onClick={handleCreate}
                  sx={{
                    textTransform: 'none',
                  }}
              >
                Thêm Ca
              </Button>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon/>
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {isLoading ? (
              <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                <CircularProgress/>
              </Box>
          ) : shifts.length === 0 ? (
              <Box sx={{textAlign: 'center', py: 4}}>
                <Typography color="text.secondary">
                  Chưa có ca làm việc nào. Nhấn "Thêm Ca" để tạo mới.
                </Typography>
              </Box>
          ) : (
              <TableContainer component={Paper} elevation={0} sx={{mt: 2}}>
                <Table>
                  <TableHead>
                    <TableRow sx={{backgroundColor: '#F5F5F5'}}>
                      <TableCell sx={{fontWeight: 600}}>ID</TableCell>
                      <TableCell sx={{fontWeight: 600}}>Tên Ca</TableCell>
                      <TableCell sx={{fontWeight: 600}}>Giờ Bắt Đầu</TableCell>
                      <TableCell sx={{fontWeight: 600}}>Giờ Kết Thúc</TableCell>
                      <TableCell sx={{fontWeight: 600}}>Trạng Thái</TableCell>
                      <TableCell sx={{fontWeight: 600}} align="center">
                        Thao Tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map((shift) => (
                        <TableRow
                            key={shift.id}
                            sx={{'&:hover': {backgroundColor: '#F9F9F9'}}}
                        >
                          <TableCell>{shift.id}</TableCell>
                          <TableCell>{shift.name}</TableCell>
                          <TableCell>
                            <Chip
                                label={formatTimeForDisplay(shift.startTime)}
                                size="small"
                                variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                                label={formatTimeForDisplay(shift.endTime)}
                                size="small"
                                variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                                checked={shift.isActive}
                                onChange={() => handleStatusToggle(shift)}
                                disabled={statusUpdating === shift.id}
                                size="small"
                            />
                            {statusUpdating === shift.id && (
                                <CircularProgress size={16} sx={{ml: 1}}/>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(shift)}
                                title="Chỉnh sửa"
                            >
                              <EditIcon fontSize="small"/>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
          )}
        </DialogContent>
      </>
  );

  const renderFormView = () => (
      <>
        <DialogTitle sx={{pb: 1}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={handleBack} size="small">
                <ArrowBackIcon/>
              </IconButton>
              <Typography variant="h6" sx={{fontWeight: 600}}>
                {viewMode === 'edit' ? 'Chỉnh Sửa Ca Làm Việc' : 'Thêm Ca Làm Việc Mới'}
              </Typography>
            </Stack>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon/>
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{mt: 2}}>
            <TextField
                label="Tên Ca Làm Việc *"
                fullWidth
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="VD: Ca sáng, Ca chiều"
                sx={{
                  '& .MuiOutlinedInput-root': {
                  },
                }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                  label="Giờ Bắt Đầu *"
                  type="time"
                  fullWidth
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  error={!!errors.startTime}
                  helperText={errors.startTime}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      step: 60,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      },
                  }}
              />

              <TextField
                  label="Giờ Kết Thúc *"
                  type="time"
                  fullWidth
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  error={!!errors.endTime}
                  helperText={errors.endTime}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      step: 60,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      },
                  }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{px: 3, pb: 3}}>
          <Button
              onClick={handleBack}
              variant="outlined"
              sx={{
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
              startIcon={
                isSubmitting ? <CircularProgress size={20} color="inherit"/> : <SaveIcon/>
              }
              sx={{
                textTransform: 'none',
                px: 3,
              }}
          >
            {isSubmitting ? 'Đang lưu...' : viewMode === 'edit' ? 'Cập Nhật' : 'Lưu'}
          </Button>
        </DialogActions>
      </>
  );

  return (
      <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
      >
        {viewMode === 'list' ? renderListView() : renderFormView()}
      </Dialog>
  );
};