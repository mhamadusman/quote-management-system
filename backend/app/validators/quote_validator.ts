import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { QuoteFields } from '../constants/quote_fields.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

const QUOTE_STATUSES = ['draft', 'in_review', 'accepted', 'rejected'] as const
const DECIMAL_REGEX = /^\d+(\.\d+)?$/

export const quoteSchemaValidator = vine.compile(
  vine.object({
    [QuoteFields.NAME]: vine.string().trim().minLength(2).maxLength(120),
    [QuoteFields.PARTNER_NAME]: vine.string().trim().maxLength(120).optional(),
    [QuoteFields.CONTRACT_LENGTH]: vine.number().positive().optional(),
    [QuoteFields.MONTHLY_REVENUE]: vine.string().trim().regex(DECIMAL_REGEX).optional(),
    [QuoteFields.TCV]: vine.string().trim().regex(DECIMAL_REGEX).optional(),
    [QuoteFields.TOTAL_REVENUE]: vine.string().trim().regex(DECIMAL_REGEX).optional(),
    [QuoteFields.STATUS]: vine.enum(QUOTE_STATUSES).optional(),
  })
)

quoteSchemaValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.NAME}.required`]: QuoteMessages.ERROR.NAME_REQUIRED,
  [`${QuoteFields.NAME}.minLength`]: QuoteMessages.ERROR.NAME_MIN_LENGTH,
  [`${QuoteFields.NAME}.maxLength`]: QuoteMessages.ERROR.NAME_MAX_LENGTH,
  [`${QuoteFields.PARTNER_NAME}.maxLength`]: QuoteMessages.ERROR.PARTNER_NAME_MAX_LENGTH,
  [`${QuoteFields.MONTHLY_REVENUE}.required`]: QuoteMessages.ERROR.MONTHLY_REVENUE_REQUIRED,
  [`${QuoteFields.MONTHLY_REVENUE}.regex`]: QuoteMessages.ERROR.MONTHLY_REVENUE_DECIMAL,
  [`${QuoteFields.TCV}.required`]: QuoteMessages.ERROR.TCV_REQUIRED,
  [`${QuoteFields.TCV}.regex`]: QuoteMessages.ERROR.TCV_DECIMAL,
  [`${QuoteFields.TOTAL_REVENUE}.required`]: QuoteMessages.ERROR.TOTAL_REVENUE_REQUIRED,
  [`${QuoteFields.TOTAL_REVENUE}.regex`]: QuoteMessages.ERROR.TOTAL_REVENUE_DECIMAL,
  [`${QuoteFields.STATUS}.required`]: QuoteMessages.ERROR.STATUS_REQUIRED,
  [`${QuoteFields.STATUS}.enum`]: QuoteMessages.ERROR.STATUS_INVALID,
  [`${QuoteFields.CONTRACT_LENGTH}.positive`]: QuoteMessages.ERROR.CONTRACT_LENGTH_POSITIVE,
})

export const quoteIdValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
  })
)

quoteIdValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
})
