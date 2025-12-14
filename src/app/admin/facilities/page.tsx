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
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

  const handleAddFacility = () => {
    console.log('Add new facility');
    // TODO: Open dialog or navigate to add facility page
  };

  const handleEditFacility = (id: number) => {
    console.log('Edit facility:', id);
    // TODO: Open edit dialog or navigate to edit page
  };

  const handleDeleteFacility = (id: number) => {
    console.log('Delete facility:', id);
    // TODO: Show confirmation dialog and delete
  };

  const filteredFacilities = mockFacilities.filter((facility) =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <TableCell sx={{ fontWeight: 600 }}>Sức Chứa</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hiện Tại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tỷ Lệ Lấp Đầy</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFacilities.map((facility) => {
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
                  <TableCell>{facility.capacity}</TableCell>
                  <TableCell>{facility.currentOccupancy}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${occupancyPercentage}%`}
                      color={getOccupancyColor(
                        facility.currentOccupancy,
                        facility.capacity
                      )}
                      size="small"
                    />
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

      {filteredFacilities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Không tìm thấy cơ sở nào
          </Typography>
        </Box>
      )}

      {/* Summary Statistics */}
      <Stack direction="row" spacing={2} mt={3}>
        <Paper elevation={2} sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Tổng Cơ Sở
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {mockFacilities.length}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Tổng Sức Chứa
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {mockFacilities.reduce((sum, f) => sum + f.capacity, 0)}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Hiện Đang Sử Dụng
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {mockFacilities.reduce((sum, f) => sum + f.currentOccupancy, 0)}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Cơ Sở Hoạt Động
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }} color="success.main">
            {mockFacilities.filter((f) => f.status === 'active').length}
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
