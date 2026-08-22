import { memo } from 'react';
import { Chip } from '@mui/material';
import type { QuoteStatus } from '../../types';

export interface QuoteStatusChipProps {
  status: QuoteStatus;
}

const statusConfig: Record<QuoteStatus, { label: string; bgcolor: string; color: string; border: string }> = {
  draft: {
    label: 'Draft',
    bgcolor: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
  },
  in_review: {
    label: 'In Review',
    bgcolor: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
  },
  approved: {
    label: 'Approved',
    bgcolor: '#D1FAE5',
    color: '#047857',
    border: '#A7F3D0',
  },
  rejected: {
    label: 'Rejected',
    bgcolor: '#FEE2E2',
    color: '#B91C1C',
    border: '#FECACA',
  },
};

const QuoteStatusChipComponent = (props: QuoteStatusChipProps) => {
  const config = statusConfig[props.status] || statusConfig.draft;

  return (
    <Chip
      size="small"
      label={config.label}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
        fontSize: '0.72rem',
        height: '22px',
        borderRadius: '4px',
      }}
    />
  );
};

export const QuoteStatusChip = memo(QuoteStatusChipComponent);
