import { memo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Typography,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  RestartAlt as ResetIcon,
  Public as RegionIcon,
  SwapHoriz as TypeIcon,
  AccountBalance as ServiceIcon,
} from '@mui/icons-material';
import type { CorridorFilterParams } from '../../../utils';

export interface CorridorFiltersProps {
  filters: CorridorFilterParams;
  onFilterChange: (key: keyof CorridorFilterParams, value: string) => void;
  onClearFilters?: () => void;
  availableRegions: string[];
  availableTypes: string[];
  availableServices: string[];
  selectedCount: number;
  totalFiltered: number;
}

const CorridorFiltersComponent = (props: CorridorFiltersProps) => {
  const hasActiveFilters = Boolean(
    (props.filters.searchQuery && props.filters.searchQuery.trim() !== '') ||
    (props.filters.region && props.filters.region !== 'all') ||
    (props.filters.transactionType && props.filters.transactionType !== 'all') ||
    (props.filters.service && props.filters.service !== 'all')
  );
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.25,
        mb: 2,
        p: 1.5,
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, flex: 1 }}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Filter by country, partner, payer..."
          value={props.filters.searchQuery || ''}
          onChange={(e) => props.onFilterChange('searchQuery', e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '0.95rem', color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: props.filters.searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => props.onFilterChange('searchQuery', '')}
                    edge="end"
                    aria-label="Clear search"
                    sx={{ p: 0.25 }}
                  >
                    <ClearIcon sx={{ fontSize: '0.8rem' }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            width: { xs: '100%', sm: 220 },
            '& .MuiOutlinedInput-root': {
              height: 32,
              fontSize: '0.78rem',
            },
          }}
        />

        {/* Region Filter */}
        <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
          <Select
            value={props.filters.region || 'all'}
            onChange={(e) => props.onFilterChange('region', e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 0.25 }}>
                <RegionIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              height: 32,
              fontSize: '0.78rem',
              '& .MuiSelect-select': { py: '4px' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All Regions</MenuItem>
            {props.availableRegions.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.78rem' }}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Transaction Type Filter */}
        <FormControl size="small" sx={{ minWidth: 110, width: { xs: '100%', sm: 'auto' } }}>
          <Select
            value={props.filters.transactionType || 'all'}
            onChange={(e) => props.onFilterChange('transactionType', e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 0.25 }}>
                <TypeIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              height: 32,
              fontSize: '0.78rem',
              '& .MuiSelect-select': { py: '4px' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All Types</MenuItem>
            {props.availableTypes.map((t) => (
              <MenuItem key={t} value={t} sx={{ fontSize: '0.78rem' }}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Service Filter */}
        <FormControl size="small" sx={{ minWidth: 125, width: { xs: '100%', sm: 'auto' } }}>
          <Select
            value={props.filters.service || 'all'}
            onChange={(e) => props.onFilterChange('service', e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 0.25 }}>
                <ServiceIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              height: 32,
              fontSize: '0.78rem',
              '& .MuiSelect-select': { py: '4px' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All Services</MenuItem>
            {props.availableServices.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.78rem' }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Right Controls: Clear Filters & Attached Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {hasActiveFilters && props.onClearFilters && (
          <Button
            size="small"
            variant="text"
            onClick={props.onClearFilters}
            startIcon={<ResetIcon sx={{ fontSize: '0.85rem' }} />}
            sx={{
              fontSize: '0.72rem',
              height: 26,
              px: 1,
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '4px',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            Clear Filters
          </Button>
        )}

        <Chip
          size="small"
          label={`${props.selectedCount} attached`}
          color={props.selectedCount > 0 ? 'primary' : 'default'}
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            borderRadius: '4px',
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          ({props.totalFiltered} available)
        </Typography>
      </Box>
    </Box>
  );
};

export const CorridorFilters = memo(CorridorFiltersComponent);
