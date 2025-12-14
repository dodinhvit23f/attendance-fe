import React from 'react';
import { Stack, Link, useTheme } from '@mui/material';

export const FooterLinks: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={3}
      alignItems="center"
      justifyContent="center"
    >
      <Link
        href="#"
        underline="hover"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '14px',
          cursor: 'pointer',
          textUnderlineOffset: '4px',
        }}
      >
        Quên mật khẩu?
      </Link>
      <Link
        href="#"
        underline="hover"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '14px',
          cursor: 'pointer',
          textUnderlineOffset: '4px',
        }}
      >
        Quảng Cáo
      </Link>
    </Stack>
  );
};
