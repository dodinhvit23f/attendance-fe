import React from 'react';
import { Box, Divider, Link, Stack, Typography, useTheme } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

export const FooterLinks: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack spacing={2.5} alignItems="center">
      {/* Subtle links row */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Link
          href="/auth/forgot-password"
          underline="none"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '13px',
            transition: 'color 0.15s',
            '&:hover': { color: theme.palette.text.primary },
          }}
        >
          Quên mật khẩu?
        </Link>
        <Box
          sx={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            backgroundColor: theme.palette.divider,
          }}
        />
        <Link
          href="#"
          underline="none"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '13px',
            transition: 'color 0.15s',
            '&:hover': { color: theme.palette.text.primary },
          }}
        >
          Quảng Cáo
        </Link>
      </Stack>

      {/* Divider */}
      <Divider sx={{ width: '100%', borderColor: theme.palette.divider }} />

      {/* Sign-up CTA */}
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Chưa có tài khoản?
        </Typography>
        <Link
          href="/subscribe"
          underline="none"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: '14px',
            px: 2,
            py: 0.75,
            borderRadius: '20px',
            border: `1.5px solid ${theme.palette.primary.main}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              '& .arrow-icon': { transform: 'translateX(3px)' },
            },
          }}
        >
          Đăng Ký Ngay
          <ArrowForward
            className="arrow-icon"
            sx={{ fontSize: '15px', transition: 'transform 0.2s ease' }}
          />
        </Link>
      </Stack>
    </Stack>
  );
};
