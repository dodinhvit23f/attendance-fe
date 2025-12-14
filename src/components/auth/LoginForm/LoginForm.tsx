'use client';

import React, { useState } from 'react';
import { TextField, Button, InputAdornment, IconButton, useTheme, Stack } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password });
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <TextField
        label="Tài khoản"
        placeholder="Email hoặc tên tài khoản"
        type="email"
        fullWidth
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />

      <TextField
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderWidth: '2px',
              borderColor: '#D0D0D0',
            },
            '&:hover fieldset': {
              borderWidth: '2px',
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{
          borderRadius: '24px',
          padding: '12px 24px',
          height: '48px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: '0px 4px 12px rgba(109, 76, 65, 0.2)',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: '0px 6px 16px rgba(109, 76, 65, 0.3)',
          },
        }}
      >
        Đăng nhập
      </Button>
    </Stack>
  );
};
