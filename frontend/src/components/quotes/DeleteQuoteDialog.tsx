import { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingIndicator } from '../common';
import type { Quote } from '../../types';

export interface DeleteQuoteDialogProps {
  open: boolean;
  quote: Quote | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteQuoteDialogComponent = (props: DeleteQuoteDialogProps) => {
  if (!props.quote) return null;

  return (
    <Dialog
      open={props.open}
      onClose={props.isDeleting ? undefined : props.onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '8px',
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', pb: 1 }}>
        Delete Quotation
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.85rem', color: '#475569', mb: 1 }}>
          Are you sure you want to delete quotation <strong>&quot;{props.quote.name}&quot;</strong>?
        </DialogContentText>
        <DialogContentText sx={{ fontSize: '0.78rem', color: '#EF4444' }}>
          This action cannot be undone and will permanently remove all attached corridor configuration.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={props.onCancel}
          disabled={props.isDeleting}
          sx={{ fontSize: '0.8rem', borderRadius: '4px', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={props.onConfirm}
          disabled={props.isDeleting}
          sx={{ fontSize: '0.8rem', borderRadius: '4px', textTransform: 'none' }}
        >
          {props.isDeleting ? <LoadingIndicator size={16} /> : 'Delete Quote'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const DeleteQuoteDialog = memo(DeleteQuoteDialogComponent);
