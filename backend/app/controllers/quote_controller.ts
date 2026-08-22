import type { HttpContext } from '@adonisjs/core/http'
import { quoteSchemaValidator, quoteIdValidator, updateQuoteValidator } from '#validators/quote_validator'
import QuoteManager from '../managers/quote_manager.ts'
import { QuoteFields } from '../constants/quote_fields.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

export default class QuoteController {
  // Store a newly created quote with optional initial corridors and fee overrides
  async store({ request, response, auth }: HttpContext) {
    const validatedData = await request.validateUsing(quoteSchemaValidator)
    const user = auth.getUserOrFail()
    const { corridors, ...quoteData } = validatedData

    const quote = await QuoteManager.createQuote(
      {
        ...quoteData,
        [QuoteFields.OWNER_ID]: user.id,
        [QuoteFields.VERSION]: 1,
      },
      corridors,
      {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      }
    )

    return response.status(SuccessCodes.CREATED).send({
      message: QuoteMessages.SUCCESS.STORE,
      data: { quote },
    })
  }

  // Retrieve a single quote with corridors preloaded
  async show({ params, response, auth }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.getQuote(id, user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.SHOW,
      data: { quote },
    })
  }

  // Retrieve all quotes owned by the authenticated user
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const quotes = await QuoteManager.getQuotesByOwner(user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.SHOW,
      data: { quotes },
    })
  }

  // Delete a quote
  async destroy({ params, request, response, auth }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })
    const user = auth.getUserOrFail()

    await QuoteManager.deleteQuote(id, user.id, {
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return response.status(SuccessCodes.NO_CONTENT).send({
      message: QuoteMessages.SUCCESS.DELETE,
    })
  }

  // Update quote general scalar fields only (2 DB queries total inside transaction)
  async update({ params, request, response, auth }: HttpContext) {
    const validated = await updateQuoteValidator.validate({
      id: params.id,
      ...request.body(),
    })

    const user = auth.getUserOrFail()

    const quote = await QuoteManager.updateQuote(
      validated.id,
      user.id,
      validated.version,
      {
        name: validated.name,
        partnerName: validated.partnerName,
        contractLength: validated.contractLength,
        status: validated.status,
      },
      {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      }
    )

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.UPDATE,
      data: { quote },
    })
  }
}
