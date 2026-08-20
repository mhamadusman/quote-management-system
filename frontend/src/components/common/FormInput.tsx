import { memo } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface FormInputProps extends Omit<TextFieldProps, 'error'> {
  label: string;
  error?: FieldError | string;
  registration?: UseFormRegisterReturn;
}

const FormInputComponent = (props: FormInputProps) => {
  const errorMessage = typeof props.error === 'string' ? props.error : props.error?.message;
  const hasError = Boolean(errorMessage);
  const displayLabel = hasError ? errorMessage : props.label;

  return (
    <TextField
      fullWidth
      size="small"
      label={displayLabel}
      error={hasError}
      slotProps={props.slotProps}
      type={props.type}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      disabled={props.disabled}
      select={props.select}
      defaultValue={props.defaultValue}
      value={props.value}
      onChange={props.onChange}
      {...props.registration}
      {...props.inputProps}
    >
      {props.children}
    </TextField>
  );
};

export const FormInput = memo(FormInputComponent);
