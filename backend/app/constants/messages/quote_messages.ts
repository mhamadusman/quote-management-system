import { QuoteFields } from '../quote_fields.ts'

export const QuoteMessages = {
  SUCCESS: {
    STORE: 'Quote created successfully',
    SHOW: 'Quote retrieved successfully',
    DELETE: 'Quote deleted successfully',
  },

  ERROR: {
    NAME_REQUIRED: `${QuoteFields.NAME} is required`,
    NAME_MIN_LENGTH: `${QuoteFields.NAME} must be at least 2 characters long`,
    NAME_MAX_LENGTH: `${QuoteFields.NAME} cannot exceed 120 characters`,
    PARTNER_NAME_MAX_LENGTH: `${QuoteFields.PARTNER_NAME} cannot exceed 120 characters`,
    MONTHLY_REVENUE_REQUIRED: `${QuoteFields.MONTHLY_REVENUE} is required`,
    MONTHLY_REVENUE_DECIMAL: `${QuoteFields.MONTHLY_REVENUE} must be a valid decimal number`,
    TCV_REQUIRED: `${QuoteFields.TCV} is required`,
    TCV_DECIMAL: `${QuoteFields.TCV} must be a valid decimal number`,
    TOTAL_REVENUE_REQUIRED: `${QuoteFields.TOTAL_REVENUE} is required`,
    TOTAL_REVENUE_DECIMAL: `${QuoteFields.TOTAL_REVENUE} must be a valid decimal number`,
    STATUS_REQUIRED: `${QuoteFields.STATUS} is required`,
    STATUS_INVALID: `${QuoteFields.STATUS} must be one of: draft, sent, accepted, rejected`,
    CONTRACT_LENGTH_POSITIVE: `${QuoteFields.CONTRACT_LENGTH} must be a positive integer`,
    NOT_CREATED: 'Could not create the quote, please try again',
    ID_REQUIRED: `${QuoteFields.ID} is required`,
    ID_INVALID: `${QuoteFields.ID} must be a valid number`,
    NOT_FOUND: 'Quote not found',
  },
} as const
