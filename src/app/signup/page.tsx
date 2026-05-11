'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBackOutlined,
  BusinessOutlined,
  EmailOutlined,
  LocationOnOutlined,
  PersonOutlined,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoading } from '@/components/root/client-layout';

const planLabels: Record<string, string> = {
  free: 'Miễn Phí',
  pro: 'Pro',
  premium: 'Premium',
};

function SignUpForm() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? 'free';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    storeName: '',
    storeAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setLoading: setGlobalLoading } = useLoading();

  useEffect(() => {
    setGlobalLoading(false);
  }, []);

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: call register API
      await new Promise((r) => setTimeout(r, 800));
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
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
        borderWidth: '2px',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px 14px',
      fontSize: '14px',
    },
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 5,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '24px',
          padding: { xs: '28px 24px', sm: '40px 44px' },
          backgroundColor: 'rgba(250, 247, 245, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px 0 rgba(109, 76, 65, 0.15)',
        }}
      >
        {/* Back button */}
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackOutlined />}
            onClick={() => router.push('/subscribe')}
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              p: '4px 8px',
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(109, 76, 65, 0.06)' },
            }}
          >
            Quay lại
          </Button>
        </Box>

        {/* Header */}
        <Stack spacing={0.75} alignItems="center" sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: 'center', color: theme.palette.text.primary }}
          >
            Tạo Tài Khoản
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}
          >
            Gói đã chọn:{' '}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: theme.palette.primary.main }}
            >
              {planLabels[plan] ?? 'Miễn Phí'}
            </Box>
          </Typography>
        </Stack>

        {/* Form */}
        <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
          {/* Username */}
          <TextField
            label="Tên tài khoản"
            placeholder="Nhập tên tài khoản"
            value={formData.username}
            onChange={handleChange('username')}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ color: theme.palette.text.secondary, fontSize: '20px' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Email */}
          <TextField
            label="Email"
            placeholder="example@email.com"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: theme.palette.text.secondary, fontSize: '20px' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Password */}
          <TextField
            label="Mật khẩu"
            placeholder="Tối thiểu 8 ký tự"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Phone */}
          <TextField
            label="Số điện thoại"
            placeholder="0901 234 567"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlined sx={{ color: theme.palette.text.secondary, fontSize: '20px' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Divider label */}
          <Box sx={{ pt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                fontSize: '11px',
              }}
            >
              Thông tin cửa hàng
            </Typography>
            <Box sx={{ mt: 0.75, height: '1px', backgroundColor: theme.palette.divider }} />
          </Box>

          {/* Store Name */}
          <TextField
            label="Tên cửa hàng"
            placeholder="Nhập tên cửa hàng của bạn"
            value={formData.storeName}
            onChange={handleChange('storeName')}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessOutlined sx={{ color: theme.palette.text.secondary, fontSize: '20px' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Store Address */}
          <TextField
            label="Địa chỉ cửa hàng"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            value={formData.storeAddress}
            onChange={handleChange('storeAddress')}
            required
            fullWidth
            multiline
            rows={2}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: '14px' }}>
                    <LocationOnOutlined sx={{ color: theme.palette.text.secondary, fontSize: '20px' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              ...inputSx,
              '& .MuiOutlinedInput-input': {
                fontSize: '14px',
              },
            }}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 0.5,
              borderRadius: '24px',
              py: 1.5,
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              boxShadow: '0px 4px 12px rgba(109, 76, 65, 0.25)',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 6px 16px rgba(109, 76, 65, 0.35)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(109, 76, 65, 0.4)',
                color: '#fff',
              },
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </Button>

          {/* Login link */}
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, textAlign: 'center', mt: 0.5 }}
          >
            Đã có tài khoản?{' '}
            <Box
              component="span"
              onClick={() => router.push('/')}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Đăng nhập
            </Box>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
