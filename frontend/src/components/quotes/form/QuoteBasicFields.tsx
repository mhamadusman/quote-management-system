import { memo } from 'react';
import { Grid, MenuItem } from '@mui/material';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormInput } from '../../common';
import type { CreateQuotePayload } from '../../../types';

export interface QuoteBasicFieldsProps {
  register: UseFormRegister<CreateQuotePayload>;
  errors: FieldErrors<CreateQuotePayload>;
  disabled?: boolean;
}

const QuoteBasicFieldsComponent = (props: QuoteBasicFieldsProps) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {/* Quote Name */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormInput
          label="Quote Name *"
          placeholder="e.g. Asia-Europe Remittance 2026"
          error={props.errors.name}
          disabled={props.disabled}
          registration={props.register('name', {
            required: 'Quote name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
        />
      </Grid>

      {/* Partner Name */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormInput
          label="Partner Name *"
          placeholder="e.g. Acme Payments Ltd"
          error={props.errors.partnerName}
          disabled={props.disabled}
          registration={props.register('partnerName', {
            required: 'Partner name is required',
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
        />
      </Grid>

      {/* Contract Length (1 to 5 only) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormInput
          select
          label="Contract Length (Years) *"
          defaultValue={1}
          error={props.errors.contractLength}
          disabled={props.disabled}
          registration={props.register('contractLength', {
            required: 'Contract length is required',
            valueAsNumber: true,
            min: { value: 1, message: 'Minimum 1 year' },
            max: { value: 5, message: 'Maximum 5 years' },
          })}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <MenuItem key={num} value={num} sx={{ fontSize: '0.8125rem' }}>
              {num} {num === 1 ? 'Year' : 'Years'}
            </MenuItem>
          ))}
        </FormInput>
      </Grid>
    </Grid>
  );
};

export const QuoteBasicFields = memo(QuoteBasicFieldsComponent);
