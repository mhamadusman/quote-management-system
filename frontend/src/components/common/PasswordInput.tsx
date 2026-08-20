import { useState, memo } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface PasswordInputProps extends Omit<TextFieldProps, 'error' | 'type'> {
  label: string;
  error?: FieldError | string;
  registration?: UseFormRegisterReturn;
}

const PasswordInputComponent = (props: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const errorMessage = typeof props.error === 'string' ? props.error : props.error?.message;
  const hasError = Boolean(errorMessage);
  const displayLabel = hasError ? errorMessage : props.label;

  return (
    <TextField
      fullWidth
      size="small"
      type={showPassword ? 'text' : 'password'}
      label={displayLabel}
      placeholder={props.placeholder || 'Enter your password'}
      autoComplete={props.autoComplete || 'current-password'}
      error={hasError}
      disabled={props.disabled}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOff sx={{ fontSize: '1.1rem' }} />
                ) : (
                  <Visibility sx={{ fontSize: '1.1rem' }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props.registration}
    />
  );
};

export const PasswordInput = memo(PasswordInputComponent);
