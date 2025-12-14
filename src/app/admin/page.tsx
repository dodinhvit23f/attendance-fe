'use client';

import * as React from 'react';
import { Box, Typography, Paper, Grid, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '12px',
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Paper>
);

export default function AdminDashboard() {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Tổng Quan
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng Nhân Viên"
            value={45}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="#6D4C41"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Có Mặt Hôm Nay"
            value={38}
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng Điểm Danh"
            value={1247}
            icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tỷ Lệ Tham Dự"
            value="84%"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="#FF9800"
          />
        </Grid>
      </Grid>

      {/* Welcome Message */}
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Chào mừng quản trị viên
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sử dụng menu bên trái để quản lý nhân viên và điểm danh
        </Typography>
      </Paper>
    </Box>
  );
}
