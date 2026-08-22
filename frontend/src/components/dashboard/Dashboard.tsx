import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Container, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteService } from '../../api/quote';
import { QuoteCard, EmptyQuotes, QuoteForm, DeleteQuoteDialog } from '../quotes';
import { DashboardHeader } from './DashboardHeader';
import { DashboardToolbar } from './DashboardToolbar';
import { filterQuotes, handleApiSuccess, handleApiError } from '../../utils';
import type { Quote } from '../../types';
import '../../styles/quotes/quotes.css';

export interface DashboardProps {}

export const Dashboard = (props: DashboardProps) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const { data: quotesResponse, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => QuoteService.getAll(),
  });

  const rawQuotes = quotesResponse?.data;
  const quotes: Quote[] = Array.isArray(rawQuotes)
    ? rawQuotes
    : (rawQuotes as unknown as { quotes?: Quote[] })?.quotes || [];

  const filteredQuotes = useMemo(() => {
    return filterQuotes(quotes, searchQuery, statusFilter);
  }, [quotes, searchQuery, statusFilter]);

  const handleToggleCreateQuote = () => {
    if (viewMode !== 'list') {
      setViewMode('list');
      setSelectedQuote(null);
    } else {
      setSelectedQuote(null);
      setViewMode('create');
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('view');
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('edit');
  };

  const handleDeletePrompt = (quote: Quote) => {
    setQuoteToDelete(quote);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    try {
      const res = await QuoteService.delete(quoteToDelete.id);
      handleApiSuccess(res.message || 'Quote deleted successfully');
      setQuoteToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    } catch (err: unknown) {
      handleApiError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuotesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 8);
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 60px)',
        minHeight: 'calc(100vh - 60px)',
        maxHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 1.5, md: 2 },
          pb: 1,
        }}
      >
        {/* Fixed Header & Toolbar on Dashboard with Dynamic Scroll Shadow */}
        <Box
          sx={{
            flexShrink: 0,
            backgroundColor: 'background.default',
            zIndex: 5,
            pb: 1,
            px: { xs: 0.5, sm: 3 },
            pt: { xs: 0.5, sm: 2 },
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            boxShadow: isScrolled
              ? '0 6px 16px -4px rgba(15, 23, 42, 0.07), 0 2px 6px -2px rgba(15, 23, 42, 0.04)'
              : 'none',
            borderBottom: isScrolled ? '1px solid #E2E8F0' : '1px solid transparent',
          }}
        >
          <DashboardHeader
            isCreating={viewMode !== 'list'}
            onCreateQuote={handleToggleCreateQuote}
          />

          {viewMode === 'list' && (quotes.length > 0 || searchQuery.trim() !== '' || statusFilter !== 'all') && (
            <DashboardToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              filteredCount={filteredQuotes.length}
              totalCount={quotes.length}
            />
          )}
        </Box>

        {/* Scrollable Main Area with Hidden Scrollbar */}
        <Box
          onScroll={handleQuotesScroll}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pt: 1,
            pb: 4,
            pr: 0.5,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          <AnimatePresence mode="wait">
            {viewMode !== 'list' ? (
              <QuoteForm
                key={`quote-form-${viewMode}-${selectedQuote?.id || 'new'}`}
                mode={viewMode}
                quote={selectedQuote}
                onCancel={() => {
                  setViewMode('list');
                  setSelectedQuote(null);
                }}
                onSuccess={() => {
                  setViewMode('list');
                  setSelectedQuote(null);
                }}
                onSwitchToEdit={() => {
                  setViewMode('edit');
                }}
              />
            ) : (
              <motion.div
                key="quotes-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {/* UX States: Loading -> Empty -> Grid */}
                {isLoading ? (
                  <div className="quotes-grid">
                    {[1, 2, 3].map((n) => (
                      <Box
                        key={n}
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                        }}
                      >
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={18} sx={{ mb: 2 }} />
                        <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: '8px' }} />
                        <Skeleton variant="text" width="30%" height={16} />
                      </Box>
                    ))}
                  </div>
                ) : quotes.length === 0 ? (
                  <EmptyQuotes onCreateClick={handleToggleCreateQuote} />
                ) : filteredQuotes.length === 0 ? (
                  <EmptyQuotes
                    title="No matching quotations"
                    description="No quotations match your search and filter criteria. Try adjusting or clearing your filters."
                  />
                ) : (
                  <div className="quotes-grid">
                    {filteredQuotes.map((quote) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        onClick={handleViewQuote}
                        onView={handleViewQuote}
                        onEdit={handleEditQuote}
                        onDelete={handleDeletePrompt}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Container>

      {/* Delete Confirmation Modal */}
      <DeleteQuoteDialog
        open={Boolean(quoteToDelete)}
        quote={quoteToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuoteToDelete(null)}
      />
    </Box>
  );
};

