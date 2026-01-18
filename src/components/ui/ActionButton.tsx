'use client';

import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface ActionButtonProps extends ButtonProps {
  loading?: boolean;
}

export function ActionButton({
  loading = false,
  children,
  startIcon,
  disabled,
  sx,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      sx={{
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        minWidth: { xs: 'auto', sm: '100px' },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}
