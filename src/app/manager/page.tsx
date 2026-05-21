'use client';

import { Box, Typography, Grid } from '@mui/material';

export default function ManagerPage() {
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