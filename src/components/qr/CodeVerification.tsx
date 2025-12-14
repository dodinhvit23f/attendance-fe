'use client';

import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Stack, TextField, Button, Typography, useTheme } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface CodeVerificationProps {
  onConfirm?: (code: string) => void;
  codeLength?: number;
}

export const CodeVerification: React.FC<CodeVerificationProps> = ({
  onConfirm,
  codeLength = 6,
}) => {
  const theme = useTheme();
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle left/right arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, codeLength);

    // Only allow digits
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => {
      if (idx < codeLength) {
        newCode[idx] = char;
      }
    });
    setCode(newCode);
    setError('');

    // Focus last filled input or next empty
    const lastFilledIndex = Math.min(pastedData.length, codeLength - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleConfirm = () => {
    const fullCode = code.join('');

    if (fullCode.length !== codeLength) {
      setError(`Vui lòng nhập đầy đủ ${codeLength} chữ số`);
      return;
    }

    if (onConfirm) {
      onConfirm(fullCode);
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        Nhập mã {codeLength} chữ số từ mã QR
      </Typography>

      {/* Code Input Fields */}
      <Stack direction="row" spacing={1.5} justifyContent="center">
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(index, e.target.value)
            }
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
              handleKeyDown(index, e)
            }
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 600,
                padding: '16px 0',
              },
            }}
            sx={{
              width: { xs: '45px', sm: '56px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                '& fieldset': {
                  borderWidth: '2px',
                  borderColor: digit ? theme.palette.primary.main : '#D0D0D0',
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
            }}
          />
        ))}
      </Stack>

      {/* Error Message */}
      {error && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.error.main,
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {error}
        </Typography>
      )}

      {/* Resend Code Link */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '13px',
          textAlign: 'center',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }}
      >
        Không nhận được mã? Quét lại QR
      </Typography>

      {/* Confirm Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<CheckCircle />}
        onClick={handleConfirm}
        disabled={!isCodeComplete}
        sx={{
          borderRadius: '24px',
          padding: '12px 24px',
          height: '56px',
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
          '&:disabled': {
            backgroundColor: '#D0D0D0',
            color: '#FFFFFF',
          },
        }}
      >
        Xác nhận
      </Button>
    </Stack>
  );
};
