import React from 'react';
import { Paper, Stack, useTheme } from '@mui/material';

interface LoginCardProps {
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: '24px',
        padding: { xs: '24px', sm: '32px', md: '48px' },
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'rgba(250, 247, 245, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px 0 rgba(109, 76, 65, 0.15)',
      }}
    >
      <Stack spacing={3}>
        {children}
      </Stack>
    </Paper>
  );
};
