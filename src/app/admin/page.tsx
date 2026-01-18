'use client';

import * as React from 'react';
import { Box, Typography, Paper, Grid, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {useEffect} from "react";
import {useLoading} from "@/components/root/client-layout";

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
      p: { xs: 2, sm: 3 },
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 1.5, sm: 2 },
      height: '100%',
    }}
  >
    <Box
      sx={{
        width: { xs: 48, sm: 60 },
        height: { xs: 48, sm: 60 },
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
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          mb: 0.5,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}
      >
        {title}
      </Typography>
    </Box>
  </Paper>
);

export default function AdminDashboard() {
  const {setLoading} = useLoading();

  useEffect(() => {
    setLoading(false)
  }, []);

  return (
    <Box sx={{ width: '100%', p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}
      >
        Tổng Quan
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng Nhân Viên"
            value={45}
            icon={<PeopleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
            color="#6D4C41"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Có Mặt Hôm Nay"
            value={38}
            icon={<CheckCircleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng Điểm Danh"
            value={1247}
            icon={<AssignmentIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
            color="#2196F3"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tỷ Lệ Tham Dự"
            value="84%"
            icon={<TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
            color="#FF9800"
          />
        </Grid>
      </Grid>

      {/* Welcome Message */}
      <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Chào mừng quản trị viên
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }}}
        >
          Sử dụng menu bên trái để quản lý nhân viên và điểm danh
        </Typography>
      </Paper>
    </Box>
  );
}
