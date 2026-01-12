'use client';

import { Box, Typography, Paper, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {useLoading} from "@/components/root/client-layout";

export default function ManagerPage() {
  const router = useRouter();
  const {setLoading} = useLoading();

  useEffect(() => {
    setLoading(false)
  }, [router]);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Trang Quản Lý
      </Typography>
      <Grid container spacing={3}>
        <Grid sx={{ xs: 12 }} >

        </Grid>
      </Grid>
    </Box>
  );
}