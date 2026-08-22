import { memo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

export interface DashboardToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  filteredCount: number;
  totalCount: number;
}

const DashboardToolbarComponent = (props: DashboardToolbarProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.25,
        mb: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, width: { xs: '100%', sm: 'auto' } }}>
        <TextField
          size="small"
          placeholder="Search quotes..."
          value={props.searchQuery}
          onChange={(e) => props.onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '0.95rem', color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: props.searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => props.onSearchChange('')} edge="end" aria-label="Clear search" sx={{ p: 0.25 }}>
                    <ClearIcon sx={{ fontSize: '0.8rem' }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            width: { xs: '100%', sm: 200, md: 220 },
            bgcolor: '#FFFFFF',
            '& .MuiOutlinedInput-root': {
              height: 32,
              fontSize: '0.78rem',
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 125, width: { xs: '100%', sm: 'auto' } }}>
          <Select
            value={props.statusFilter}
            onChange={(e) => props.onStatusFilterChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 0.25 }}>
                <FilterIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              height: 32,
              bgcolor: '#FFFFFF',
              fontSize: '0.78rem',
              '& .MuiSelect-select': {
                py: '4px',
              },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All Statuses</MenuItem>
            <MenuItem value="draft" sx={{ fontSize: '0.78rem' }}>Draft</MenuItem>
            <MenuItem value="in_review" sx={{ fontSize: '0.78rem' }}>In Review</MenuItem>
            <MenuItem value="approved" sx={{ fontSize: '0.78rem' }}>Approved</MenuItem>
            <MenuItem value="rejected" sx={{ fontSize: '0.78rem' }}>Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontSize: '0.78rem',
          color: 'text.secondary',
          fontWeight: 500,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {props.searchQuery.trim() || props.statusFilter !== 'all'
          ? `Showing ${props.filteredCount} of ${props.totalCount} ${props.totalCount === 1 ? 'quote' : 'quotes'}`
          : `Total: ${props.totalCount} ${props.totalCount === 1 ? 'quote' : 'quotes'}`}
      </Typography>
    </Box>
  );
};

export const DashboardToolbar = memo(DashboardToolbarComponent);
