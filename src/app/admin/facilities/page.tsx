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
  Switch,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { FacilityDialog, FacilityData } from '@/components/admin';
import { useLoading } from '@/components/root/client-layout';
import { getFacilities, Facility, toggleFacilityStatus } from '@/lib/api/admin';
import { useNotify } from '@/components/notification/NotificationProvider';
import { ErrorMessage } from '@/lib/constants';

export default function FacilitiesPage() {
  const { setLoading } = useLoading();
  const { notifyError, notifySuccess } = useNotify();
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState<FacilityData | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const fetchFacilities = React.useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await getFacilities({ page: 0, size: 100 });
      setFacilities(response.data || []);
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Không thể tải danh sách cơ sở');
        notifyError(errorMessage);
      }
      setFacilities([]);
    } finally {
      setIsLoadingData(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch facilities only on initial mount
  React.useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFacility = () => {
    setSelectedFacility(null);
    setDialogOpen(true);
  };

  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility({
      id: facility.id,
      name: facility.name,
      address: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      allowedRadius: facility.allowDistance,
      status: facility.active ? 'active' : 'inactive',
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const newStatus = !currentActive;
    setTogglingId(id);
    try {
      await toggleFacilityStatus(id, newStatus);
      // Update local state
      setFacilities((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: newStatus } : f))
      );
      notifySuccess('Cập nhật trạng thái thành công!');
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = ErrorMessage.getMessage(error.message, 'Có lỗi xảy ra khi cập nhật trạng thái');
        notifyError(errorMessage);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveFacility = (facilityData: FacilityData) => {
    // Update local state instead of refetching all data
    if (facilityData.id) {
      // Update existing facility in local state
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === facilityData.id
            ? {
                ...f,
                name: facilityData.name,
                address: facilityData.address,
                latitude: Number(facilityData.latitude),
                longitude: Number(facilityData.longitude),
                allowDistance: facilityData.allowedRadius || 100,
              }
            : f
        )
      );
    } else {
      // For new facility, refetch to get the server-generated ID
      fetchFacilities();
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFacility(null);
  };

  const filteredFacilities = facilities.filter((facility) =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredFacilities.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFacilities = filteredFacilities.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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
          Quản Lý Cơ Sở
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFacility}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Thêm Cơ Sở
        </Button>
      </Stack>

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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

      {/* Loading State */}
      {isLoadingData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Facilities Table */}
      {!isLoadingData && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên Cơ Sở</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Địa Chỉ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phạm Vi (m)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Thao Tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFacilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                      <LocationOnIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        Chưa có cơ sở nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bấm nút "Thêm Cơ Sở" để tạo cơ sở đầu tiên
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddFacility}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          mt: 1,
                        }}
                      >
                        Thêm Cơ Sở
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFacilities.map((facility) => (
                  <TableRow
                    key={facility.id}
                    sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
                  >
                    <TableCell>{facility.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography>{facility.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {facility.address}
                    </TableCell>
                    <TableCell>
                      {facility.allowDistance}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={facility.active}
                            onChange={() => handleToggleStatus(facility.id, facility.active)}
                            color="success"
                            size="small"
                            disabled={togglingId === facility.id}
                          />
                        }
                        label={togglingId === facility.id ? 'Đang cập nhật...' : (facility.active ? 'Hoạt động' : 'Ngừng')}
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.875rem',
                            color: togglingId === facility.id ? 'text.disabled' : (facility.active ? 'success.main' : 'text.secondary'),
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditFacility(facility)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {!isLoadingData && filteredFacilities.length > 0 && totalPages > 1 && (
        <Stack spacing={2} alignItems="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredFacilities.length)} của {filteredFacilities.length} cơ sở
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Stack>
      )}

      {/* Facility Dialog */}
      <FacilityDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveFacility}
        facility={selectedFacility}
      />
    </Box>
  );
}
