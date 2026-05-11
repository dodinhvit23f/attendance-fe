'use client';

import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Close,
  LockReset,
  Security,
  Visibility,
  VisibilityOff,
  Warning,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LoginCard } from '@/components/auth';
import { useNotify } from '@/components/notification/NotificationProvider';
import { forgotPasswordApi } from '@/lib/api/auth';

// ─── Constants ────────────────────────────────────────────────────────────────

const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000;

// ─── OTP Dialog ───────────────────────────────────────────────────────────────

interface OtpDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => Promise<void>;
}

const OtpDialog: React.FC<OtpDialogProps> = ({ open, onClose, onConfirm }) => {
  const theme = useTheme();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(CODE_LENGTH).fill(''));
      setError('');
      setConfirmLoading(false);
      setFailedAttempts(0);
      setBlockedUntil(null);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    if (!blockedUntil) return;
    const tick = () => {
      const left = Math.max(0, blockedUntil - Date.now());
      setTimeLeft(left);
      if (left === 0) {
        setBlockedUntil(null);
        setFailedAttempts(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockedUntil]);

  const isBlocked = blockedUntil !== null && timeLeft > 0;

  const formatCountdown = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const nums = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      if (nums.length > 0) {
        const next = Array(CODE_LENGTH).fill('');
        nums.split('').forEach((c, i) => { next[i] = c; });
        setDigits(next);
        setError('');
        inputRefs.current[Math.min(nums.length, CODE_LENGTH - 1)]?.focus();
      }
      return;
    }
    if (value && !/^\d$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH);
    if (!/^\d+$/.test(pasted)) return;
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    setError('');
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleConfirm = async () => {
    if (isBlocked) return;
    const fullCode = digits.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError(`Vui lòng nhập đầy đủ ${CODE_LENGTH} chữ số`);
      return;
    }
    setError('');
    setConfirmLoading(true);
    try {
      await onConfirm(fullCode);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : '';
      if (errorCode === 'OTP_NOT_CORRECT') {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          setBlockedUntil(Date.now() + BLOCK_DURATION_MS);
        } else {
          setError(`Mã OTP không chính xác. Còn ${MAX_ATTEMPTS - next} lần thử.`);
        }
      } else if (errorCode === 'USER_NOT_EXIST') {
        setError('Tài khoản không tồn tại hoặc chưa được kích hoạt.');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleClose = () => {
    if (!confirmLoading) onClose();
  };

  const isComplete = digits.every(d => d !== '');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: 'rgba(250, 247, 245, 0.97)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px 0 rgba(109, 76, 65, 0.2)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton
            onClick={handleClose}
            disabled={confirmLoading}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.primary.main}30)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Security sx={{ fontSize: 34, color: theme.palette.primary.main }} />
          </Box>

          <Stack spacing={0.5} alignItems="center">
            <Typography variant="h6" fontWeight={700} color="text.primary" textAlign="center">
              Xác Thực OTP
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
            </Typography>
          </Stack>

          {/* Rate-limit countdown banner */}
          {isBlocked && (
            <Box
              sx={{
                width: '100%',
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#fff3e0',
                border: '1px solid #ffe0b2',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Warning sx={{ color: '#f57c00', fontSize: 20, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" fontWeight={600} color="#e65100">
                  Quá nhiều lần thử sai
                </Typography>
                <Typography variant="caption" color="#f57c00">
                  Vui lòng thử lại sau:{' '}
                  <Box component="strong">{formatCountdown(timeLeft)}</Box>
                </Typography>
              </Box>
            </Box>
          )}

          {/* Digit inputs */}
          <Stack direction="row" spacing={1.5} justifyContent="center">
            {digits.map((digit, index) => (
              <TextField
                key={index}
                inputRef={el => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={confirmLoading || isBlocked}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: {
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    padding: '14px 0',
                  },
                }}
                sx={{
                  width: { xs: '42px', sm: '50px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    transition: 'transform 0.1s ease',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: digit ? theme.palette.primary.main : '#D0D0D0',
                    },
                    '&:hover fieldset': {
                      borderWidth: '2px',
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused': {
                      transform: 'scale(1.05)',
                      '& fieldset': {
                        borderWidth: '2px',
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    '&.Mui-disabled': { opacity: 0.5 },
                  },
                }}
              />
            ))}
          </Stack>

          {/* Error message */}
          {error && !isBlocked && (
            <Typography variant="body2" color="error" textAlign="center" fontWeight={500}>
              {error}
            </Typography>
          )}

          {/* Attempts remaining hint */}
          {!isBlocked && failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && !error && (
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Còn {MAX_ATTEMPTS - failedAttempts} lần thử
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleConfirm}
            disabled={!isComplete || confirmLoading || isBlocked}
            startIcon={
              confirmLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />
            }
            sx={{
              borderRadius: '24px',
              height: '52px',
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0px 4px 12px rgba(109, 76, 65, 0.2)',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 6px 16px rgba(109, 76, 65, 0.3)',
              },
              '&:disabled': { backgroundColor: '#D0D0D0', color: '#FFFFFF' },
            }}
          >
            {confirmLoading ? 'Đang xác thực...' : 'Xác Nhận'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

// ─── Password strength helper ─────────────────────────────────────────────────

const getPasswordStrength = (pw: string) => {
  if (!pw) return { label: '', color: '', value: 0 };
  if (pw.length < 8) return { label: 'Yếu', color: '#ef5350', value: 25 };
  if (pw.length < 12) return { label: 'Trung bình', color: '#ff9800', value: 50 };
  if (!/(?=.*[A-Z])(?=.*\d)/.test(pw)) return { label: 'Khá', color: '#2196f3', value: 75 };
  return { label: 'Mạnh', color: '#4caf50', value: 100 };
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const router = useRouter();
  const { notifySuccess } = useNotify();

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const textFieldBase = { borderRadius: '12px', backgroundColor: '#FFFFFF' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (newPassword.length < 8) {
      setFormError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }
    setOtpDialogOpen(true);
  };

  const handleOtpConfirm = async (otp: string) => {
    await forgotPasswordApi(username, newPassword, otp);
    notifySuccess('Đặt lại mật khẩu thành công!');
    setOtpDialogOpen(false);
    router.push('/');
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
        py: 3,
        position: 'relative',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <LoginCard>
          {/* Header */}
          <Stack spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.primary.main}35)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockReset sx={{ fontSize: 38, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h4" fontWeight={600} color="text.primary" textAlign="center">
              Đặt Lại Mật Khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nhập thông tin để tạo mật khẩu mới
            </Typography>
          </Stack>

          {/* Form */}
          <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
            <TextField
              label="Tài khoản"
              placeholder="Email hoặc tên tài khoản"
              type="text"
              fullWidth
              variant="outlined"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  ...textFieldBase,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
                '& .MuiOutlinedInput-input': { padding: '12px 16px', fontSize: '14px' },
              }}
            />

            {/* New password + strength bar */}
            <Box>
              <TextField
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                type={showNew ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(p => !p)} edge="end">
                          {showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    ...textFieldBase,
                    '& fieldset': { borderWidth: '2px', borderColor: '#D0D0D0' },
                    '&:hover fieldset': { borderWidth: '2px', borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: theme.palette.primary.main },
                  },
                  '& .MuiOutlinedInput-input': { padding: '12px 16px', fontSize: '14px' },
                }}
              />
              {newPassword && (
                <Box sx={{ mt: 1, px: 0.5 }}>
                  <Box
                    sx={{
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: '#E0E0E0',
                      overflow: 'hidden',
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${strength.value}%`,
                        backgroundColor: strength.color,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Confirm password */}
            <TextField
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              error={passwordsMismatch}
              helperText={
                passwordsMismatch
                  ? 'Mật khẩu không khớp'
                  : passwordsMatch
                  ? '✓ Mật khẩu khớp'
                  : ''
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(p => !p)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                formHelperText: {
                  sx: {
                    color: passwordsMatch && !passwordsMismatch ? '#4caf50' : undefined,
                    fontWeight: 500,
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  ...textFieldBase,
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: passwordsMismatch
                      ? theme.palette.error.main
                      : passwordsMatch
                      ? '#4caf50'
                      : '#D0D0D0',
                  },
                  '&:hover fieldset': { borderWidth: '2px', borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: theme.palette.primary.main },
                },
                '& .MuiOutlinedInput-input': { padding: '12px 16px', fontSize: '14px' },
              }}
            />

            {formError && (
              <Typography variant="body2" color="error" textAlign="center" fontWeight={500}>
                {formError}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                borderRadius: '24px',
                height: '52px',
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
              Tiếp Theo
            </Button>
          </Stack>

          {/* Back to login */}
          <Stack alignItems="center">
            <Link
              href="/"
              underline="none"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: theme.palette.text.secondary,
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.15s',
                '&:hover': { color: theme.palette.primary.main },
              }}
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Quay lại đăng nhập
            </Link>
          </Stack>
        </LoginCard>
      </Box>

      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onConfirm={handleOtpConfirm}
      />
    </Container>
  );
}
