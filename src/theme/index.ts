import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { borderRadius, breakpoints } from './tokens';

// Base theme with palette, typography, and component overrides
const baseTheme = createTheme({
  breakpoints,

  palette: {
    mode: 'light',

    primary: {
      main: '#6D4C41',
      dark: '#4E342E',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#D7CCC8',
      contrastText: '#3E2723',
    },

    background: {
      default: '#FFFFFF',
      paper: '#FAF7F5',
    },

    text: {
      primary: '#3E2723',
      secondary: '#6D4C41',
    },

    divider: '#E0D7D3',

    error: {
      main: '#C62828',
    },
  },

  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,

    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#3E2723',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#3E2723',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: '#3E2723',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#3E2723',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#3E2723',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#3E2723',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },

  shape: {
    borderRadius: borderRadius.md,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.md,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6D4C41',
            },
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.lg,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1.25rem',
          padding: '20px 24px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: borderRadius.md,
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E0D7D3',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#FAF7F5',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.md,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          margin: '2px 4px',
        },
      },
    },
  },
});

// Apply responsive font sizes
export const theme = responsiveFontSizes(baseTheme);
