import { memo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export interface DashboardHeaderProps {
  onCreateQuote: () => void;
  isCreating?: boolean;
}

const DashboardHeaderComponent = (props: DashboardHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 1.5,
      }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.68rem',
            lineHeight: 1.2,
            letterSpacing: '0.06em',
            display: 'block',
          }}
        >
          Workspace
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.45rem' },
            fontWeight: 700,
            lineHeight: 1.25,
            color: '#0F172A',
            mt: 0.25,
          }}
        >
          {props.isCreating ? 'Create Quotation' : 'Quotations'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.25 }}>
          {props.isCreating
            ? 'Define quotation parameters, contract terms, and attach remittance corridors.'
            : 'Manage and review cross-border pricing quotes for your partners and corridors.'}
        </Typography>
      </Box>

      <Button
        variant={props.isCreating ? 'outlined' : 'contained'}
        color="primary"
        startIcon={props.isCreating ? undefined : <AddIcon sx={{ fontSize: '0.9rem' }} />}
        onClick={props.onCreateQuote}
        sx={{
          height: 34,
          px: 1.75,
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {props.isCreating ? 'Back to Quotes' : 'Create Quotation'}
      </Button>
    </Box>
  );
};

export const DashboardHeader = memo(DashboardHeaderComponent);
