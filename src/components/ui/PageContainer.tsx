'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function PageContainer({ children, maxWidth = 'xl' }: PageContainerProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        maxWidth: maxWidth ? `${maxWidth}` : undefined,
        mx: 'auto',
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
}
