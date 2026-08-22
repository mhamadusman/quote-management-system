import type { Corridor } from '../types';

export interface CorridorFilterParams {
  searchQuery?: string;
  region?: string;
  transactionType?: string;
  service?: string;
}

export const filterCorridors = (
  corridors: Corridor[],
  filters: CorridorFilterParams
): Corridor[] => {
  const search = filters.searchQuery?.toLowerCase().trim() || '';
  const region = filters.region || 'all';
  const txType = filters.transactionType || 'all';
  const service = filters.service || 'all';

  return corridors.filter((c) => {
    if (region !== 'all' && c.region !== region) {
      return false;
    }
    if (txType !== 'all' && c.transactionType !== txType) {
      return false;
    }
    if (service !== 'all' && c.service !== service) {
      return false;
    }
    if (search) {
      const matchCountry = c.country?.toLowerCase().includes(search);
      const matchPartner = c.receivingPartner?.toLowerCase().includes(search);
      const matchPayer = c.payer?.toLowerCase().includes(search);
      const matchCurrency = c.payoutCurrency?.toLowerCase().includes(search);
      const matchRegion = c.region?.toLowerCase().includes(search);
      if (!matchCountry && !matchPartner && !matchPayer && !matchCurrency && !matchRegion) {
        return false;
      }
    }
    return true;
  });
};
