import { memo } from 'react';
import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

export interface SubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  label: string;
}

const SubmitButtonComponent = (props: SubmitButtonProps) => {
  const isSubmitting = Boolean(props.isLoading);

  return (
    <Button
      type="submit"
      fullWidth
      variant={props.variant || 'contained'}
      color={props.color || 'primary'}
      disabled={isSubmitting || props.disabled}
      startIcon={
        isSubmitting ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          props.startIcon
        )
      }
      sx={{
        mt: props.sx && 'mt' in props.sx ? props.sx.mt : 1,
        height: 38,
        borderRadius: '4px',
        fontWeight: 600,
        ...props.sx,
      }}
    >
      {isSubmitting ? props.loadingText || 'Please wait...' : props.label}
    </Button>
  );
};

export const SubmitButton = memo(SubmitButtonComponent);
