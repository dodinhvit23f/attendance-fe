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
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { FacilityDialog, FacilityData } from '@/components/admin';

// Mock data
const mockFacilities = [
  {
    id: 1,
    name: 'Văn phòng Hà Nội',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    capacity: 150,
    currentOccupancy: 120,
    status: 'active',
  },
  {
    id: 2,
    name: 'Chi nhánh Hồ Chí Minh',
    address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
    capacity: 200,
    currentOccupancy: 180,
    status: 'active',
  },
  {
    id: 3,
    name: 'Văn phòng Đà Nẵng',
    address: '789 Trần Phú, Hải Châu, Đà Nẵng',
    capacity: 80,
    currentOccupancy: 65,
    status: 'active',
  },
  {
    id: 4,
    name: 'Chi nhánh Cần Thơ',
    address: '321 Mậu Thân, Ninh Kiều, Cần Thơ',
    capacity: 50,
    currentOccupancy: 0,
    status: 'inactive',
  },
];

export default function FacilitiesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState<FacilityData | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const handleAddFacility = () => {
    setSelectedFacility(null);
    setDialogOpen(true);
  };

  const handleEditFacility = (id: number) => {
    const facility = mockFacilities.find((f) => f.id === id);
    if (facility) {
      setSelectedFacility({
        ...facility,
        latitude: 21.0285, // Mock coordinates - replace with actual data
        longitude: 105.8542,
        status: facility.status as 'active' | 'inactive',
      });
      setDialogOpen(true);
    }
  };

  const handleDeleteFacility = (id: number) => {
    console.log('Delete facility:', id);
    // TODO: Show confirmation dialog and delete
  };

  const handleSaveFacility = (facilityData: FacilityData) => {
    console.log('Save facility:', facilityData);
    // TODO: Add API call to save facility
    // If editing: PUT /api/facilities/:id
    // If creating: POST /api/facilities
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFacility(null);
  };

  const filteredFacilities = mockFacilities.filter((facility) =>
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

  const getOccupancyColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      {/* Facilities Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên Cơ Sở</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Địa Chỉ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFacilities.map((facility) => {
              const occupancyPercentage = facility.capacity > 0
                ? Math.round((facility.currentOccupancy / facility.capacity) * 100)
                : 0;

              return (
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
                    <Chip
                      label={facility.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                      color={facility.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditFacility(facility.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFacility(facility.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredFacilities.length > 0 && totalPages > 1 && (
        <Stack spacing={2} alignItems="center" mt={3}>
          {/* Pagination Info Text */}
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredFacilities.length)} của {filteredFacilities.length} cơ sở
          </Typography>

          {/* Pagination Controls */}
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

      {filteredFacilities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Không tìm thấy cơ sở nào
          </Typography>
        </Box>
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
