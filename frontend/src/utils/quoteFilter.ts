import type { Quote } from '../types';

/**
 * Filters quotes by status and search query (matches against quote name or partner name).
 */
export const filterQuotes = (
  quotes: Quote[],
  searchQuery: string,
  statusFilter: string
): Quote[] => {
  return quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = q.name?.toLowerCase().includes(query);
      const partnerMatch = (q.partnerName || (q as unknown as { partner_name?: string }).partner_name)
        ?.toLowerCase()
        .includes(query);
      if (!nameMatch && !partnerMatch) {
        return false;
      }
    }
    return true;
  });
};
