import { useState, memo } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Tag as VersionIcon,
  MoreHoriz as MoreHorizIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Quote } from '../../types';
import { QuoteStatusChip } from './QuoteStatusChip';
import '../../styles/quotes/quotes.css';

export interface QuoteCardProps {
  quote: Quote;
  onClick?: (quote: Quote) => void;
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
}

const formatCurrency = (val?: number | null) => {
  if (val === undefined || val === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const QuoteCardComponent = (props: QuoteCardProps) => {
  const q = props.quote;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const isEditable = q.status === 'draft' || q.status === 'rejected';

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (props.onView) {
      props.onView(q);
    } else if (props.onClick) {
      props.onClick(q);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (isEditable && props.onEdit) {
      props.onEdit(q);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    if (props.onDelete) {
      props.onDelete(q);
    }
  };

  return (
    <Box className="quote-card" onClick={() => props.onClick && props.onClick(q)}>
      {/* Card Header: Name, Partner, Status & Action Menu */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" noWrap sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', mb: 0.25 }}>
            {q.name || 'Untitled Quote'}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
            Partner: <strong style={{ color: '#334155' }}>{q.partnerName || 'N/A'}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <QuoteStatusChip status={q.status} />

          <IconButton
            size="small"
            aria-label="Quote actions"
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              color: '#64748B',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            <MoreHorizIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={() => handleMenuClose()}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '6px',
                  boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.12)',
                  minWidth: 140,
                  border: '1px solid #E2E8F0',
                },
              },
            }}
          >
            <MenuItem onClick={handleViewClick} sx={{ fontSize: '0.78rem', py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 26 }}>
                <ViewIcon sx={{ fontSize: '0.95rem', color: '#64748B' }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '0.78rem' }}>View</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={handleEditClick}
              disabled={!isEditable}
              sx={{ fontSize: '0.78rem', py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 26 }}>
                <EditIcon sx={{ fontSize: '0.95rem', color: isEditable ? '#64748B' : '#CBD5E1' }} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: '0.78rem' }}
                secondaryTypographyProps={{ fontSize: '0.68rem' }}
                secondary={!isEditable ? `Locked (${q.status.replace('_', ' ')})` : undefined}
              >
                Edit
              </ListItemText>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleDeleteClick} sx={{ fontSize: '0.78rem', py: 0.75, color: '#EF4444' }}>
              <ListItemIcon sx={{ minWidth: 26, color: '#EF4444' }}>
                <DeleteIcon sx={{ fontSize: '0.95rem' }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 500 }}>
                Delete
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Financial Metrics Summary Grid */}
      <div className="quote-metrics-grid">
        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
            Monthly Revenue
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
            {formatCurrency(q.monthlyRevenue)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>
            Total Contract (TCV)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}>
            {formatCurrency(q.tcv)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', display: 'block' }}>
            Contract Length
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
            {q.contractLength ? `${q.contractLength} Years` : 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', display: 'block' }}>
            Corridors
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
            {q.corridors ? `${q.corridors.length} Active` : '0 Active'}
          </Typography>
        </Box>
      </div>

      <Divider sx={{ my: 1, borderColor: '#F1F5F9' }} />

      {/* Card Footer: Version & Created Date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
          <VersionIcon sx={{ fontSize: '0.75rem' }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            v{q.version || 1}
          </Typography>
        </Box>

        {q.createdAt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
            <CalendarIcon sx={{ fontSize: '0.75rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {formatDate(q.createdAt)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const QuoteCard = memo(QuoteCardComponent);

