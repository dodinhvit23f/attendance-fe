import React from 'react';
import { Divider, useTheme } from '@mui/material';

export const DividerWithText: React.FC = () => {
  const theme = useTheme();

  return (
    <Divider
      sx={{
        my: '24px',
        color: theme.palette.text.secondary,
        fontSize: '14px',
        '&::before, &::after': {
          borderColor: theme.palette.divider,
        },
      }}
    >
      Hoặc đăng nhập bằng
    </Divider>
  );
};
