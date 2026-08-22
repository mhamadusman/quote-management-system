import { memo } from 'react';
import { Typography, Button } from '@mui/material';
import { ReceiptLong as ReceiptIcon, Add as AddIcon } from '@mui/icons-material';
import '../../styles/quotes/quotes.css';

export interface EmptyQuotesProps {
  title?: string;
  description?: string;
  onCreateClick?: () => void;
}

const EmptyQuotesComponent = (props: EmptyQuotesProps) => {
  const title = props.title || 'No quotations found';
  const description =
    props.description ||
    'You don’t have any pricing quotations created yet. Start by generating a new quotation for your remittance corridors.';

  return (
    <div className="quotes-empty-container">
      <div className="empty-icon-circle">
        <ReceiptIcon sx={{ fontSize: '2rem' }} />
      </div>

      <Typography variant="h4" sx={{ fontSize: '1.15rem', fontWeight: 600, color: '#0F172A', mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 2.5, fontSize: '0.8125rem' }}>
        {description}
      </Typography>

      {props.onCreateClick && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ fontSize: '0.95rem' }} />}
          onClick={props.onCreateClick}
          sx={{ height: 36, px: 2, borderRadius: '4px' }}
        >
          Create First Quote
        </Button>
      )}
    </div>
  );
};

export const EmptyQuotes = memo(EmptyQuotesComponent);
