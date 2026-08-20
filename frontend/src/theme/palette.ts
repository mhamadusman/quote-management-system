import type { PaletteOptions } from '@mui/material/styles';

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#2563EB', // Modern corporate fintech blue
    light: '#60A5FA',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#475569', // Slate
    light: '#94A3B8',
    dark: '#1E293B',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Emerald
    light: '#D1FAE5',
    dark: '#047857',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#FEF3C7',
    dark: '#B45309',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // Rose Red
    light: '#FEE2E2',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0EA5E9', // Sky Blue
    light: '#E0F2FE',
    dark: '#0369A1',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAFC', // Crisp light background
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A', // Slate 900
    secondary: '#64748B', // Slate 500
    disabled: '#94A3B8',
  },
  divider: '#E2E8F0',
};
