import React from 'react';
import { Button, useTheme } from '@mui/material';
import { Google } from '@mui/icons-material';

interface SocialLoginButtonProps {
  provider: 'google';
  onClick?: () => void;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onClick,
}) => {
  const theme = useTheme();

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: <Google />,
          text: 'Đăng nhập bằng Google',
        };
      default:
        return {
          icon: <Google />,
          text: 'Đăng nhập bằng Google',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <Button
      variant="outlined"
      fullWidth
      size="large"
      startIcon={config.icon}
      onClick={onClick}
      sx={{
        borderRadius: '24px',
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        backgroundColor: '#FFFFFF',
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: 500,
        padding: '12px 24px',
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: theme.palette.text.secondary,
        },
      }}
    >
      {config.text}
    </Button>
  );
};
