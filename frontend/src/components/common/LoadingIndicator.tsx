import { Box, CircularProgress } from '@mui/material';

export interface LoadingIndicatorProps {
  size?: number;
}

export const LoadingIndicator = (props: LoadingIndicatorProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
      <CircularProgress size={props.size || 36} />
    </Box>
  );
};
