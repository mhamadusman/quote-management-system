import { useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import type { Corridor } from '../../../types';

export interface CorridorTableProps {
  corridors: Corridor[];
  selectedIds: Set<string | number>;
  onToggleSelect: (id: string | number) => void;
  onToggleSelectAll: () => void;
  readOnly?: boolean;
}

const formatCurrency = (num?: number) => {
  if (num === undefined || num === null) return '$0.00';
  return `$${Number(num).toFixed(2)}`;
};

const formatPercent = (num?: number) => {
  if (num === undefined || num === null) return '0%';
  return `${Number(num).toFixed(2)}%`;
};

const CorridorTableComponent = (props: CorridorTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const allSelected =
    props.corridors.length > 0 &&
    props.corridors.every((c) => props.selectedIds.has(c.id || c.corridor_id || ''));

  const someSelected =
    props.corridors.some((c) => props.selectedIds.has(c.id || c.corridor_id || '')) &&
    !allSelected;

  const rowVirtualizer = useVirtualizer({
    count: props.corridors.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <TableContainer
      ref={parentRef}
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        height: 380,
        maxHeight: 380,
        overflowY: 'auto',
      }}
    >
      <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ bgcolor: '#F8FAFC', width: 44, zIndex: 3 }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={props.onToggleSelectAll}
                disabled={props.corridors.length === 0 || props.readOnly}
              />
            </TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '22%', zIndex: 3 }}>Region / Country</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '18%', zIndex: 3 }}>Type & Service</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '12%', zIndex: 3 }}>Payout</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '22%', zIndex: 3 }}>Receiving Partner</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '13%', zIndex: 3 }}>Fixed Fee</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: '13%', zIndex: 3 }}>Variable Fee</TableCell>
            <TableCell align="right" sx={{ bgcolor: '#F8FAFC', fontWeight: 600, width: 88, zIndex: 3 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.corridors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                <Typography variant="body2">No matching corridors found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {paddingTop > 0 && (
                <TableRow sx={{ height: `${paddingTop}px` }}>
                  <TableCell colSpan={8} sx={{ p: 0, border: 0 }} />
                </TableRow>
              )}

              {virtualRows.map((virtualRow) => {
                const c = props.corridors[virtualRow.index];
                if (!c) return null;
                const corridorId = c.id || c.corridor_id || '';
                const isSelected = props.selectedIds.has(corridorId);
                const fixedFee = c.stdFixedFeeUSD ?? c.stdFixedFeeUsd;

                return (
                  <TableRow
                    key={String(corridorId)}
                    hover={!props.readOnly}
                    selected={isSelected}
                    sx={{
                      height: 52,
                      cursor: props.readOnly ? 'default' : 'pointer',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(37, 99, 235, 0.05) !important',
                      },
                    }}
                    onClick={() => !props.readOnly && props.onToggleSelect(corridorId)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={props.readOnly}
                        onChange={() => props.onToggleSelect(corridorId)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>
                        {c.country || c.destinationCountry || 'N/A'}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                        {c.region || 'Global'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        {c.transactionType && (
                          <Chip
                            size="small"
                            label={c.transactionType}
                            sx={{ fontSize: '0.66rem', height: 18, bgcolor: '#F1F5F9', px: '2px' }}
                          />
                        )}
                        <Typography variant="caption" noWrap sx={{ color: '#475569', fontSize: '0.73rem' }}>
                          {c.service || c.paymentMethod || 'BankAccount'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                        {c.payoutCurrency || c.destinationCurrency || 'USD'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" noWrap sx={{ display: 'block', color: '#334155', fontSize: '0.75rem' }}>
                        {c.receivingPartner || c.payer || 'Direct Bank Settlement'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.78rem' }}>
                        {formatCurrency(fixedFee)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.78rem' }}>
                        {formatPercent(c.variableFeePercentage)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {props.readOnly ? (
                        <Chip
                          size="small"
                          label={isSelected ? 'Attached' : 'Unlinked'}
                          color={isSelected ? 'primary' : 'default'}
                          sx={{ fontSize: '0.68rem', height: 22, borderRadius: '4px' }}
                        />
                      ) : (
                        <Button
                          size="small"
                          variant={isSelected ? 'outlined' : 'text'}
                          color={isSelected ? 'error' : 'primary'}
                          onClick={() => props.onToggleSelect(corridorId)}
                          sx={{
                            fontSize: '0.72rem',
                            py: '2px',
                            px: '8px',
                            minHeight: 24,
                            borderRadius: '4px',
                          }}
                        >
                          {isSelected ? 'Detach' : 'Attach'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {paddingBottom > 0 && (
                <TableRow sx={{ height: `${paddingBottom}px` }}>
                  <TableCell colSpan={8} sx={{ p: 0, border: 0 }} />
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const CorridorTable = memo(CorridorTableComponent);
