'use client';

import { Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  divider?: boolean;
}

export function FormSection({
  title,
  icon,
  children,
  divider = true,
}: FormSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      {divider && <Divider sx={{ mb: 2 }} />}
      {children}
    </Box>
  );
}
