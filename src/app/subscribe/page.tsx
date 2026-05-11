'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useLoading } from '@/components/root/client-layout';
import {
  CheckCircle,
  LockOutlined,
  StorefrontOutlined,
  GroupOutlined,
  HideImageOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Feature {
  icon: React.ReactNode;
  text: string;
}

interface Tier {
  id: 'free' | 'pro' | 'premium';
  label: string;
  price: string;
  priceNote: string;
  description: string;
  features: Feature[];
  highlighted: boolean;
  disabled: boolean;
  badge?: string;
  ctaLabel: string;
}

export default function SubscribePage() {
  const theme = useTheme();
  const router = useRouter();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(false);
  }, []);

  const tiers: Tier[] = [
    {
      id: 'free',
      label: 'Miễn Phí',
      price: '0₫',
      priceNote: '/tháng',
      description: 'Phù hợp cho doanh nghiệp nhỏ mới bắt đầu',
      features: [
        { icon: <StorefrontOutlined fontSize="small" />, text: '1 cơ sở' },
        { icon: <GroupOutlined fontSize="small" />, text: '20 nhân viên' },
        { icon: <CheckCircle fontSize="small" />, text: 'Chấm công cơ bản' },
        { icon: <HideImageOutlined fontSize="small" />, text: 'Xem quảng cáo để hỗ trợ nền tảng' },
      ],
      highlighted: true,
      disabled: false,
      ctaLabel: 'Bắt Đầu Ngay',
    },
    {
      id: 'pro',
      label: 'Pro',
      price: '$19',
      priceNote: '/tháng',
      description: 'Dành cho doanh nghiệp đang phát triển',
      features: [
        { icon: <StorefrontOutlined fontSize="small" />, text: '5 cơ sở' },
        { icon: <GroupOutlined fontSize="small" />, text: '100 nhân viên' },
        { icon: <CheckCircle fontSize="small" />, text: 'Không hiển thị quảng cáo' },
        { icon: <WorkspacePremiumOutlined fontSize="small" />, text: 'Báo cáo nâng cao' },
      ],
      highlighted: false,
      disabled: true,
      badge: 'Sắp Ra Mắt',
      ctaLabel: 'Sắp Ra Mắt',
    },
    {
      id: 'premium',
      label: 'Premium',
      price: '$49',
      priceNote: '/tháng',
      description: 'Giải pháp toàn diện cho doanh nghiệp lớn',
      features: [
        { icon: <StorefrontOutlined fontSize="small" />, text: 'Cơ sở không giới hạn' },
        { icon: <GroupOutlined fontSize="small" />, text: 'Nhân viên không giới hạn' },
        { icon: <CheckCircle fontSize="small" />, text: 'Không hiển thị quảng cáo' },
        { icon: <WorkspacePremiumOutlined fontSize="small" />, text: 'Toàn bộ tính năng cao cấp' },
      ],
      highlighted: false,
      disabled: true,
      badge: 'Sắp Ra Mắt',
      ctaLabel: 'Sắp Ra Mắt',
    },
  ];

  const handleSelect = (tier: Tier) => {
    if (tier.disabled) return;
    router.push(`/signup?plan=${tier.id}`);
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
        py: 6,
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Stack spacing={1.5} alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            color: theme.palette.text.primary,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
          }}
        >
          Bắt Đầu Hành Trình Của Bạn
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            maxWidth: '480px',
            lineHeight: 1.7,
          }}
        >
          Chọn gói phù hợp với nhu cầu của doanh nghiệp. Nâng cấp bất cứ lúc nào khi bạn phát triển.
        </Typography>
      </Stack>

      {/* Tier Cards */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'stretch',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1020px',
        }}
      >
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} onSelect={handleSelect} />
        ))}
      </Box>

      {/* Back to login */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
          Đã có tài khoản?{' '}
          <Link
            href="/"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Đăng nhập ngay
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

function TierCard({ tier, onSelect }: { tier: Tier; onSelect: (tier: Tier) => void }) {
  const theme = useTheme();

  const isHighlighted = tier.highlighted;
  const isDisabled = tier.disabled;

  return (
    <Box
      onClick={() => !isDisabled && onSelect(tier)}
      sx={{
        flex: { md: '1 1 0' },
        minWidth: { xs: '100%', sm: '280px' },
        maxWidth: { md: '320px' },
        position: 'relative',
        borderRadius: '20px',
        padding: { xs: '28px 24px', md: '36px 28px' },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        cursor: isDisabled ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        backgroundColor: isDisabled
          ? 'rgba(250, 247, 245, 0.6)'
          : 'rgba(250, 247, 245, 0.88)',
        backdropFilter: 'blur(20px)',
        border: isHighlighted
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${isDisabled ? 'rgba(224, 215, 211, 0.5)' : theme.palette.divider}`,
        boxShadow: isHighlighted
          ? `0 8px 32px rgba(109, 76, 65, 0.2), 0 0 0 1px rgba(109, 76, 65, 0.08)`
          : '0 4px 16px rgba(0, 0, 0, 0.06)',
        opacity: isDisabled ? 0.65 : 1,
        '&:hover': !isDisabled
          ? {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 40px rgba(109, 76, 65, 0.22)`,
              border: `2px solid ${theme.palette.primary.main}`,
            }
          : {},
      }}
    >
      {/* Badge */}
      {tier.badge && (
        <Chip
          label={tier.badge}
          size="small"
          icon={<LockOutlined style={{ fontSize: '14px' }} />}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(224, 215, 211, 0.7)',
            color: theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: '11px',
            height: '24px',
          }}
        />
      )}

      {isHighlighted && (
        <Chip
          label="Phổ Biến"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            fontWeight: 600,
            fontSize: '11px',
            height: '24px',
          }}
        />
      )}

      {/* Tier Header */}
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: isHighlighted ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          {tier.label}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.25rem' },
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1,
            }}
          >
            {tier.price}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}
          >
            {tier.priceNote}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, mt: 0.5 }}
        >
          {tier.description}
        </Typography>
      </Stack>

      {/* Divider */}
      <Box
        sx={{
          height: '1px',
          backgroundColor: isHighlighted
            ? `rgba(109, 76, 65, 0.2)`
            : theme.palette.divider,
          borderRadius: '1px',
        }}
      />

      {/* Features */}
      <Stack spacing={2} sx={{ flex: 1 }}>
        {tier.features.map((feature, i) => (
          <Stack key={i} direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                color: isHighlighted ? theme.palette.primary.main : theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {feature.icon}
            </Box>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.primary, lineHeight: 1.5 }}
            >
              {feature.text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* CTA Button */}
      <Button
        variant={isHighlighted ? 'contained' : 'outlined'}
        fullWidth
        disabled={isDisabled}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(tier);
        }}
        sx={{
          borderRadius: '24px',
          py: 1.25,
          fontWeight: 600,
          fontSize: '14px',
          textTransform: 'none',
          mt: 'auto',
          ...(isHighlighted && !isDisabled
            ? {
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                boxShadow: '0px 4px 12px rgba(109, 76, 65, 0.3)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: '0px 6px 16px rgba(109, 76, 65, 0.4)',
                },
              }
            : {
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&.Mui-disabled': {
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                },
              }),
        }}
      >
        {tier.ctaLabel}
      </Button>
    </Box>
  );
}
