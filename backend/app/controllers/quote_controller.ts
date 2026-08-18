import type { HttpContext } from '@adonisjs/core/http'
import { quoteSchemaValidator, quoteIdValidator } from '#validators/quote_validator'
import QuoteRepository from '../repositories/quote_repository.ts'
import QuoteManager from '../managers/quote_manager.ts'
import { QuoteFields } from '../constants/quote_fields.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

export default class QuoteController {
  async store({ request, response, auth }: HttpContext) {
    const validatedData = await request.validateUsing(quoteSchemaValidator)
    const user = auth.getUserOrFail()

    const quote = await QuoteRepository.create({
      ...validatedData,
      [QuoteFields.OWNER_ID]: user.id,
    })

    return response.status(SuccessCodes.CREATED).send({
      message: QuoteMessages.SUCCESS.STORE,
      data: { quote },
    })
  }

  async show({ params, response }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })

    const quote = await QuoteManager.getQuote(id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.SHOW,
      data: { quote },
    })
  }

  async destroy({ params, response }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })

    await QuoteManager.deleteQuote(id)

    return response.status(SuccessCodes.NO_CONTENT).send({
      message: QuoteMessages.SUCCESS.DELETE,
    })
  }
}
