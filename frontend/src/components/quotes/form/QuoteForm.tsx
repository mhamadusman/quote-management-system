import { useState, useMemo, useTransition, useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack as BackIcon, Check as SubmitIcon, Edit as EditIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CorridorService } from '../../../api/corridor';
import { QuoteService } from '../../../api/quote';
import { SubmitButton, LoadingIndicator } from '../../common';
import { QuoteBasicFields } from './QuoteBasicFields';
import { CorridorFilters } from './CorridorFilters';
import { CorridorTable } from './CorridorTable';
import { filterCorridors, handleApiSuccess, handleApiError } from '../../../utils';
import type { CorridorFilterParams } from '../../../utils';
import type { CreateQuotePayload, Corridor, Quote, QuoteCorridor } from '../../../types';

export interface QuoteFormProps {
  mode?: 'create' | 'edit' | 'view';
  quote?: Quote | null;
  initialValues?: Partial<CreateQuotePayload>;
  onCancel: () => void;
  onSuccess: () => void;
  onSwitchToEdit?: () => void;
}

const QuoteFormComponent = (props: QuoteFormProps) => {
  const mode = props.mode || 'create';
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [initialAttachedIds, setInitialAttachedIds] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<CorridorFilterParams>({
    searchQuery: '',
    region: 'all',
    transactionType: 'all',
    service: 'all',
  });

  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuotePayload>({
    defaultValues: {
      name: props.quote?.name || props.initialValues?.name || '',
      partnerName: props.quote?.partnerName || props.initialValues?.partnerName || '',
      contractLength: props.quote?.contractLength || props.initialValues?.contractLength || 1,
    },
    mode: 'onTouched',
  });

  // When quote changes (e.g. switching quotes or modes), reset form values
  useEffect(() => {
    if (props.quote) {
      reset({
        name: props.quote.name || '',
        partnerName: props.quote.partnerName || '',
        contractLength: props.quote.contractLength || 1,
      });
    }
  }, [props.quote, reset]);

  // Fetch all available system corridors
  const { data: corridorsResponse, isLoading: isLoadingCorridors } = useQuery({
    queryKey: ['allCorridors'],
    queryFn: () => CorridorService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const rawCorridors = corridorsResponse?.data;
  const corridors: Corridor[] = useMemo(() => {
    if (!rawCorridors) return [];
    if (Array.isArray(rawCorridors)) return rawCorridors;
    if (typeof rawCorridors === 'object' && 'corridors' in rawCorridors && Array.isArray((rawCorridors as { corridors: Corridor[] }).corridors)) {
      return (rawCorridors as { corridors: Corridor[] }).corridors;
    }
    return [];
  }, [rawCorridors]);

  // If in edit or view mode, fetch the quote's attached corridors
  const { data: attachedResponse, isLoading: isLoadingAttached } = useQuery({
    queryKey: ['quoteCorridors', props.quote?.id],
    queryFn: () => QuoteService.listCorridors(props.quote!.id),
    enabled: Boolean(props.quote?.id && (isEditMode || isViewMode)),
  });

  // Populate selected corridor IDs when attached corridors load
  useEffect(() => {
    if (attachedResponse?.data) {
      const rawAttached = attachedResponse.data;
      const list: (QuoteCorridor | Corridor)[] = Array.isArray(rawAttached)
        ? rawAttached
        : (rawAttached as unknown as { corridors?: QuoteCorridor[] })?.corridors || [];

      const attachedSet = new Set<string | number>();
      list.forEach((item) => {
        const id =
          (item as QuoteCorridor).corridorId ||
          (item as QuoteCorridor).corridor?.id ||
          (item as Corridor).id ||
          (item as Corridor).corridor_id;
        if (id !== undefined && id !== null) {
          attachedSet.add(String(id));
          attachedSet.add(Number(id));
        }
      });

      setSelectedIds(attachedSet);
      setInitialAttachedIds(new Set(attachedSet));
    }
  }, [attachedResponse]);

  // Extract unique options for filter dropdowns
  const { availableRegions, availableTypes, availableServices } = useMemo(() => {
    const regions = new Set<string>();
    const types = new Set<string>();
    const services = new Set<string>();

    corridors.forEach((c) => {
      if (c.region) regions.add(c.region);
      if (c.transactionType) types.add(c.transactionType);
      if (c.service) services.add(c.service);
    });

    return {
      availableRegions: Array.from(regions).sort(),
      availableTypes: Array.from(types).sort(),
      availableServices: Array.from(services).sort(),
    };
  }, [corridors]);

  // Filtered corridors list
  const filteredCorridors = useMemo(() => {
    return filterCorridors(corridors, filters);
  }, [corridors, filters]);

  const handleFilterChange = (key: keyof CorridorFilterParams, value: string) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setFilters({
        searchQuery: '',
        region: 'all',
        transactionType: 'all',
        service: 'all',
      });
    });
  };

  const handleToggleSelect = (id: string | number) => {
    if (isViewMode) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id) || next.has(String(id)) || next.has(Number(id))) {
        next.delete(id);
        next.delete(String(id));
        next.delete(Number(id));
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isViewMode) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allFilteredSelected = filteredCorridors.every((c) =>
        next.has(c.id || c.corridor_id || '') ||
        next.has(String(c.id || c.corridor_id || '')) ||
        next.has(Number(c.id || c.corridor_id || ''))
      );

      if (allFilteredSelected) {
        filteredCorridors.forEach((c) => {
          const cid = c.id || c.corridor_id || '';
          next.delete(cid);
          next.delete(String(cid));
          next.delete(Number(cid));
        });
      } else {
        filteredCorridors.forEach((c) => {
          const cid = c.id || c.corridor_id || '';
          next.add(cid);
        });
      }
      return next;
    });
  };

  const onSubmit = async (data: CreateQuotePayload) => {
    try {
      if (isEditMode && props.quote) {
        // 1. Update quote details
        const updateRes = await QuoteService.update(props.quote.id, {
          version: props.quote.version,
          name: data.name,
          partnerName: data.partnerName,
          contractLength: Number(data.contractLength),
        });

        // 2. Compute added vs removed corridors
        const currentSelectedArray = Array.from(selectedIds).map((id) => String(id));
        const initialArray = Array.from(initialAttachedIds).map((id) => String(id));

        const corridorsToAttach = currentSelectedArray.filter((id) => !initialArray.includes(id));
        const corridorsToRemove = initialArray.filter((id) => !currentSelectedArray.includes(id));

        if (corridorsToAttach.length > 0) {
          await QuoteService.attachCorridors(props.quote.id, {
            corridorIds: corridorsToAttach.join(','),
          });
        }

        if (corridorsToRemove.length > 0) {
          await QuoteService.removeCorridors(props.quote.id, {
            corridorIds: corridorsToRemove.join(','),
          });
        }

        handleApiSuccess(updateRes.message || 'Quote updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
        queryClient.invalidateQueries({ queryKey: ['quoteCorridors', props.quote.id] });
        props.onSuccess();
      } else {
        // Create Mode
        const createRes = await QuoteService.create({
          name: data.name,
          partnerName: data.partnerName,
          contractLength: Number(data.contractLength),
        });

        const quoteData = createRes.data as unknown as { quote?: { id: number }; id?: number };
        const quoteId = quoteData?.quote?.id || quoteData?.id;

        if (quoteId && selectedIds.size > 0) {
          const corridorIdsParam = Array.from(selectedIds).map((id) => String(id)).join(',');
          await QuoteService.attachCorridors(quoteId, {
            corridorIds: corridorIdsParam,
          });
        }

        handleApiSuccess(createRes.message || 'Quote created successfully!');
        reset();
        setSelectedIds(new Set());
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
        props.onSuccess();
      }
    } catch (err: unknown) {
      handleApiError(err, setError);
    }
  };

  const isEditable = props.quote?.status === 'draft' || props.quote?.status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{
          pb: 4,
        }}
      >
        {/* Form Top Bar: Title & Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              startIcon={<BackIcon sx={{ fontSize: '0.95rem' }} />}
              onClick={props.onCancel}
              sx={{
                color: 'text.secondary',
                fontSize: '0.78rem',
                fontWeight: 600,
                minHeight: 30,
                px: 1,
              }}
            >
              {isViewMode ? 'Back to Quotes' : 'Cancel'}
            </Button>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>
              {isViewMode
                ? `Quote Details (v${props.quote?.version || 1})`
                : isEditMode
                ? `Edit Quote: ${props.quote?.name || ''}`
                : 'New Pricing Quotation'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isViewMode ? (
              isEditable && props.onSwitchToEdit && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={props.onSwitchToEdit}
                  startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    height: 34,
                    px: 2,
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Edit Quotation
                </Button>
              )
            ) : (
              <SubmitButton
                label={isEditMode ? 'Save Changes' : 'Submit Quote'}
                loadingText="Saving..."
                isLoading={isSubmitting}
                startIcon={<SubmitIcon sx={{ fontSize: '0.95rem' }} />}
                sx={{
                  height: 34,
                  px: 2,
                  mt: 0,
                  fontSize: '0.8rem',
                  width: 'auto',
                }}
              />
            )}
          </Box>
        </Box>

        {/* 1. Basic Fields (Horizontal Row on Desktop) */}
        <QuoteBasicFields
          register={register}
          errors={errors}
          disabled={isSubmitting || isViewMode}
        />

        {/* 2. Corridor Selection Header */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.825rem' }}>
            {isViewMode ? 'Linked Remittance Corridors' : 'Attach Remittance Corridors'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            {isViewMode
              ? 'Active remittance corridors and settlement pricing rules attached to this quote.'
              : 'Select the remittance corridors and settlement partners to link with this quotation.'}
          </Typography>
        </Box>

        {/* 3. Corridor Filters */}
        <CorridorFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          availableRegions={availableRegions}
          availableTypes={availableTypes}
          availableServices={availableServices}
          selectedCount={selectedIds.size}
          totalFiltered={filteredCorridors.length}
        />

        {/* 4. Virtualized Corridor Table with Loading state */}
        {isLoadingCorridors || isLoadingAttached ? (
          <Box sx={{ py: 6, bgcolor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <LoadingIndicator size={32} />
          </Box>
        ) : (
          <CorridorTable
            corridors={filteredCorridors}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            readOnly={isViewMode}
          />
        )}
      </Box>
    </motion.div>
  );
};

export const QuoteForm = memo(QuoteFormComponent);

