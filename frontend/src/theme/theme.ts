import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

export const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 4,
  },
  components,
});

export default theme;
