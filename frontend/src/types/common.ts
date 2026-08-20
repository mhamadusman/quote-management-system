import type { TextFieldProps, ButtonProps } from '@mui/material';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface FormInputProps extends Omit<TextFieldProps, 'error'> {
  label: string;
  error?: FieldError | string;
  registration?: UseFormRegisterReturn;
}

export interface PasswordInputProps extends Omit<TextFieldProps, 'error' | 'type'> {
  label: string;
  error?: FieldError | string;
  registration?: UseFormRegisterReturn;
}

export interface SubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  label: string;
}
