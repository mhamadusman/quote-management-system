export type QuoteStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export interface Corridor {
  id: string | number;
  corridor_id?: string | number;
  versionId?: number;
  sourceRowId?: string;
  region?: string;
  country?: string;
  transactionType?: string;
  service?: string;
  receivingPartner?: string;
  payer?: string;
  payoutCurrency?: string;
  historicalATV?: number;
  atvUSD?: number;
  stdFixedFeeUSD?: number;
  stdFixedFeeUsd?: number;
  variableFeePercentage?: number;
  fxSource?: string;
  defaultFxSpread?: number;
  treasuryFxCost?: number;
  costFixedPerUSD?: number;
  costVariablePerTrx?: number;
  needsApproval?: boolean;
  sourceCountry?: string;
  sourceCurrency?: string;
  destinationCountry?: string;
  destinationCurrency?: string;
  paymentMethod?: string;
}

export interface QuoteCorridor {
  quoteId: number;
  corridorId: number;
  overrideStdFixedFeeUsd?: number | null;
  overrideVariableFeePercentage?: number | null;
  corridor?: Corridor;
}

export interface Quote {
  id: number;
  name: string;
  partnerName: string;
  contractLength: number;
  monthlyRevenue?: number;
  tcv?: number;
  totalRevenue?: number;
  status: QuoteStatus;
  version: number;
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
  corridors?: QuoteCorridor[];
}

export interface CreateQuotePayload {
  name: string;
  partnerName: string;
  contractLength: number;
  corridorIds?: number[];
}

export interface UpdateQuotePayload {
  version: number;
  name?: string;
  partnerName?: string;
  contractLength?: number;
  status?: QuoteStatus;
}

export interface AttachCorridorsPayload {
  corridorIds: number[] | string;
}

export interface UpdateQuoteCorridorPayload {
  overrideStdFixedFeeUsd?: number;
  overrideVariableFeePercentage?: number;
}

export interface RemoveCorridorsPayload {
  corridorIds: number[] | string;
}
