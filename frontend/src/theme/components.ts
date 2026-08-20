import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      body: {
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Inter', sans-serif",
      },
      // Subtle custom scrollbars
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#CBD5E1',
        borderRadius: '3px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#94A3B8',
      },
    },
  },

  // ----------------------------------------------------
  // INPUTS & FORM CONTROLS (Compact height & small placeholder)
  // ----------------------------------------------------
  MuiTextField: {
    defaultProps: {
      size: 'small',
      variant: 'outlined',
    },
  },

  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiInputLabel: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        fontSize: '0.8125rem', // 13px
        fontWeight: 400,
        color: '#64748B',
        transform: 'translate(12px, 8px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -8px) scale(0.75)',
          fontWeight: 500,
        },
        '&.Mui-focused': {
          color: '#2563EB',
        },
        '&.Mui-error': {
          color: '#EF4444',
        },
      },
      sizeSmall: {
        fontSize: '0.8125rem',
        transform: 'translate(12px, 8px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -8px) scale(0.75)',
        },
      },
    },
  },

  MuiOutlinedInput: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        borderRadius: '4px',
        backgroundColor: '#FFFFFF',
        fontSize: '0.8125rem', // 13px
        color: '#0F172A',
        transition: 'border-color 0.15s ease-in-out',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E2E8F0',
          borderWidth: '1px',
          borderRadius: '4px',
          transition: 'border-color 0.15s ease-in-out',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#94A3B8',
        },
        '&.Mui-focused': {
          boxShadow: 'none',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB',
            borderWidth: '1.5px',
            boxShadow: 'none',
          },
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '#EF4444',
        },
        '&.Mui-disabled': {
          backgroundColor: '#F1F5F9',
          color: '#94A3B8',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E2E8F0',
          },
        },
      },
      input: {
        padding: '7px 12px',
        height: '20px', // Total component height ~36px
        fontSize: '0.8125rem', // 13px
        '&::placeholder': {
          fontSize: '0.75rem', // 12px small placeholder
          color: '#94A3B8',
          opacity: 0.85,
        },
      },
      inputSizeSmall: {
        padding: '7px 12px',
        height: '20px',
        fontSize: '0.8125rem',
        '&::placeholder': {
          fontSize: '0.75rem', // 12px
          color: '#94A3B8',
          opacity: 0.85,
        },
      },
      multiline: {
        padding: '8px 12px',
      },
    },
  },

  MuiInputBase: {
    styleOverrides: {
      input: {
        '&::placeholder': {
          fontSize: '0.75rem',
          color: '#94A3B8',
          opacity: 0.85,
        },
      },
    },
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: '0.7125rem', // ~11.5px
        marginTop: '3px',
        marginLeft: '4px',
        lineHeight: 1.3,
        '&.Mui-error': {
          color: '#EF4444',
        },
      },
    },
  },

  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      select: {
        padding: '7px 12px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.8125rem',
      },
      icon: {
        color: '#64748B',
        fontSize: '1.15rem',
      },
    },
  },

  MuiAutocomplete: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          padding: '2px 8px',
        },
        '& .MuiAutocomplete-input': {
          padding: '5px 4px !important',
          fontSize: '0.8125rem',
          '&::placeholder': {
            fontSize: '0.75rem',
            color: '#94A3B8',
          },
        },
      },
      paper: {
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E2E8F0',
        marginTop: '4px',
      },
      option: {
        fontSize: '0.8125rem',
        padding: '6px 12px',
        '&[aria-selected="true"]': {
          backgroundColor: '#EFF6FF',
          fontWeight: 500,
        },
      },
    },
  },

  // ----------------------------------------------------
  // BUTTONS (Rounded, distinct states, NO hover movement)
  // ----------------------------------------------------
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      size: 'small',
    },
    styleOverrides: {
      root: {
        borderRadius: '4px',
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.8125rem',
        padding: '6px 14px',
        minHeight: '34px',
        boxShadow: 'none',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        // STRICT RULE: No translateY/scale/bounce hover movements!
        '&:hover': {
          transform: 'none !important',
          boxShadow: 'none',
        },
      },
      containedPrimary: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#1D4ED8',
          boxShadow: 'none',
        },
      },
      containedSecondary: {
        backgroundColor: '#475569',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#334155',
          boxShadow: 'none',
        },
      },
      outlined: {
        borderColor: '#CBD5E1',
        color: '#334155',
        borderRadius: '4px',
        '&:hover': {
          borderColor: '#94A3B8',
          backgroundColor: '#F8FAFC',
          boxShadow: 'none',
        },
      },
      text: {
        color: '#475569',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#F1F5F9',
          color: '#0F172A',
        },
      },
      sizeSmall: {
        padding: '4px 10px',
        fontSize: '0.75rem',
        minHeight: '28px',
      },
      sizeLarge: {
        padding: '8px 20px',
        fontSize: '0.875rem',
        minHeight: '40px',
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        color: '#64748B',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': {
          backgroundColor: '#F1F5F9',
          color: '#0F172A',
          transform: 'none !important',
        },
      },
      sizeSmall: {
        padding: '5px',
      },
    },
  },

  // ----------------------------------------------------
  // CARDS & PAPERS (Soft shadows, rounded, restrained)
  // ----------------------------------------------------
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
      },
      elevation0: {
        border: '1px solid #E2E8F0',
        boxShadow: 'none',
      },
      elevation1: {
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
      },
      elevation2: {
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
      },
    },
  },

  MuiCard: {
    defaultProps: {
      elevation: 1,
    },
    styleOverrides: {
      root: {
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        // NO hover lift-up
        '&:hover': {
          transform: 'none !important',
        },
      },
    },
  },

  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '16px 20px',
      },
      title: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#0F172A',
      },
      subheader: {
        fontSize: '0.775rem',
        color: '#64748B',
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '16px 20px',
        '&:last-child': {
          paddingBottom: '16px',
        },
      },
    },
  },

  // ----------------------------------------------------
  // CHIPS & STATUS BADGES
  // ----------------------------------------------------
  MuiChip: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: '6px',
        fontSize: '0.725rem',
        height: '22px',
      },
      filled: {
        border: '1px solid transparent',
      },
      outlined: {
        borderColor: '#E2E8F0',
      },
    },
  },

  // ----------------------------------------------------
  // TABLES (Data-focused, clean borders)
  // ----------------------------------------------------
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: '#F8FAFC',
        '& .MuiTableCell-head': {
          color: '#475569',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid #E2E8F0',
          padding: '10px 14px',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #F1F5F9',
        padding: '10px 14px',
        fontSize: '0.8125rem',
        color: '#0F172A',
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.1s ease',
        '&:hover': {
          backgroundColor: '#F8FAFC',
        },
        '&:last-child .MuiTableCell-root': {
          borderBottom: 'none',
        },
      },
    },
  },

  // ----------------------------------------------------
  // DIALOGS & MENUS
  // ----------------------------------------------------
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: '0.8125rem',
        padding: '7px 14px',
        borderRadius: '4px',
        margin: '2px 4px',
        '&:hover': {
          backgroundColor: '#F1F5F9',
        },
        '&.Mui-selected': {
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#DBEAFE',
          },
        },
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        fontSize: '0.725rem',
        borderRadius: '6px',
        padding: '4px 8px',
      },
      arrow: {
        color: '#0F172A',
      },
    },
  },
};
