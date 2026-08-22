import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { QuoteFields } from '../constants/quote_fields.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

const QUOTE_STATUSES = ['draft', 'in_review', 'approved', 'rejected'] as const
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
    [QuoteFields.CORRIDORS]: vine
      .array(
        vine.object({
          [QuoteFields.CORRIDOR_ID]: vine.string().trim(),
          [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
          [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
        })
      )
      .optional(),
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
  'corridors.*.corridorId.required': QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED,
  'corridors.*.overrideStdFixedFeeUsd.regex':
    QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL,
  'corridors.*.overrideVariableFeePercentage.regex':
    QuoteMessages.ERROR.OVERRIDE_VARIABLE_FEE_PERCENTAGE_DECIMAL,
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

export const updateQuoteValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.VERSION]: vine.number().positive(),
    [QuoteFields.NAME]: vine.string().trim().minLength(2).maxLength(120).optional(),
    [QuoteFields.PARTNER_NAME]: vine.string().trim().maxLength(120).optional(),
    [QuoteFields.CONTRACT_LENGTH]: vine.number().positive().optional(),
    [QuoteFields.STATUS]: vine.enum(QUOTE_STATUSES).optional(),
  })
)

updateQuoteValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.VERSION}.required`]: QuoteMessages.ERROR.VERSION_REQUIRED,
  [`${QuoteFields.VERSION}.positive`]: QuoteMessages.ERROR.VERSION_POSITIVE,
  [`${QuoteFields.NAME}.minLength`]: QuoteMessages.ERROR.NAME_MIN_LENGTH,
  [`${QuoteFields.NAME}.maxLength`]: QuoteMessages.ERROR.NAME_MAX_LENGTH,
  [`${QuoteFields.PARTNER_NAME}.maxLength`]: QuoteMessages.ERROR.PARTNER_NAME_MAX_LENGTH,
  [`${QuoteFields.CONTRACT_LENGTH}.positive`]: QuoteMessages.ERROR.CONTRACT_LENGTH_POSITIVE,
  [`${QuoteFields.STATUS}.enum`]: QuoteMessages.ERROR.STATUS_INVALID,
})

export const corridorParamValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.CORRIDOR_ID]: vine.string().trim(),
  })
)

corridorParamValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.CORRIDOR_ID}.required`]: QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED,
})

export const attachQuoteCorridorsValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.VERSION]: vine.number().positive().optional(),
    [QuoteFields.CORRIDORS]: vine
      .array(
        vine.object({
          [QuoteFields.CORRIDOR_ID]: vine.string().trim(),
          [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
          [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
        })
      )
      .minLength(1),
  })
)

attachQuoteCorridorsValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.CORRIDORS}.required`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
  [`${QuoteFields.CORRIDORS}.minLength`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
  'corridors.*.corridorId.required': QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED,
  'corridors.*.overrideStdFixedFeeUsd.regex':
    QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL,
  'corridors.*.overrideVariableFeePercentage.regex':
    QuoteMessages.ERROR.OVERRIDE_VARIABLE_FEE_PERCENTAGE_DECIMAL,
})

export const updateSingleCorridorOverrideValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.CORRIDOR_ID]: vine.string().trim(),
    [QuoteFields.VERSION]: vine.number().positive(),
    [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: vine
      .string()
      .trim()
      .regex(DECIMAL_REGEX)
      .optional(),
    [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: vine
      .string()
      .trim()
      .regex(DECIMAL_REGEX)
      .optional(),
  })
)

updateSingleCorridorOverrideValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.CORRIDOR_ID}.required`]: QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED,
  [`${QuoteFields.VERSION}.required`]: QuoteMessages.ERROR.VERSION_REQUIRED,
  [`${QuoteFields.VERSION}.positive`]: QuoteMessages.ERROR.VERSION_POSITIVE,
  [`${QuoteFields.OVERRIDE_STD_FIXED_FEE_USD}.regex`]:
    QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL,
  [`${QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE}.regex`]:
    QuoteMessages.ERROR.OVERRIDE_VARIABLE_FEE_PERCENTAGE_DECIMAL,
})

export const batchUpdateCorridorsValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.VERSION]: vine.number().positive(),
    [QuoteFields.CORRIDORS]: vine
      .array(
        vine.object({
          [QuoteFields.CORRIDOR_ID]: vine.string().trim(),
          [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
          [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: vine
            .string()
            .trim()
            .regex(DECIMAL_REGEX)
            .optional(),
        })
      )
      .minLength(1),
  })
)

batchUpdateCorridorsValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.VERSION}.required`]: QuoteMessages.ERROR.VERSION_REQUIRED,
  [`${QuoteFields.VERSION}.positive`]: QuoteMessages.ERROR.VERSION_POSITIVE,
  [`${QuoteFields.CORRIDORS}.required`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
  [`${QuoteFields.CORRIDORS}.minLength`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
  'corridors.*.corridorId.required': QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED,
  'corridors.*.overrideStdFixedFeeUsd.regex':
    QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL,
  'corridors.*.overrideVariableFeePercentage.regex':
    QuoteMessages.ERROR.OVERRIDE_VARIABLE_FEE_PERCENTAGE_DECIMAL,
})

export const batchRemoveCorridorsValidator = vine.compile(
  vine.object({
    [QuoteFields.ID]: vine.number(),
    [QuoteFields.CORRIDOR_IDS]: vine.array(vine.string().trim()).minLength(1),
  })
)

batchRemoveCorridorsValidator.messagesProvider = new SimpleMessagesProvider({
  [`${QuoteFields.ID}.required`]: QuoteMessages.ERROR.ID_REQUIRED,
  [`${QuoteFields.ID}.number`]: QuoteMessages.ERROR.ID_INVALID,
  [`${QuoteFields.CORRIDOR_IDS}.required`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
  [`${QuoteFields.CORRIDOR_IDS}.minLength`]: QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED,
})
