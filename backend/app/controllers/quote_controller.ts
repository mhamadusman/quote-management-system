import type { HttpContext } from '@adonisjs/core/http'
import {
  quoteSchemaValidator,
  quoteIdValidator,
  attachCorridorsValidator,
  removeCorridorsValidator,
} from '#validators/quote_validator'
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
      [QuoteFields.VERSION]: 1,
    })

    return response.status(SuccessCodes.CREATED).send({
      message: QuoteMessages.SUCCESS.STORE,
      data: { quote },
    })
  }

  async show({ params, response, auth }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.getQuote(id, user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.SHOW,
      data: { quote },
    })
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const quotes = await QuoteManager.getQuotesByOwner(user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.SHOW,
      data: { quotes },
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })
    const user = auth.getUserOrFail()

    await QuoteManager.deleteQuote(id, user.id)

    return response.status(SuccessCodes.NO_CONTENT).send({
      message: QuoteMessages.SUCCESS.DELETE,
    })
  }

  async attachCorridors({ params, request, response, auth }: HttpContext) {
    const { id, corridorIds } = await attachCorridorsValidator.validate({
      id: params.id,
      corridorIds: request.body().corridorIds,
    })
    const user = auth.getUserOrFail()

    const parsedCorridorIds = [
      ...new Set(
        corridorIds
          .split(',')
          .map((corridorId: string) => corridorId.trim())
          .filter(Boolean)
      ),
    ]

    await QuoteManager.attachCorridors(Number(id), user.id, parsedCorridorIds)
    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.ATTACH_CORRIDORS,
    })
  }

  async removeCorridors({ params, request, response, auth }: HttpContext) {
    const { id, corridorIds } = await removeCorridorsValidator.validate({
      id: params.id,
      corridorIds: request.body().corridorIds,
    })
    const user = auth.getUserOrFail()

    const parsedCorridorIds = [
      ...new Set(
        corridorIds
          .split(',')
          .map((corridorId: string) => corridorId.trim())
          .filter(Boolean)
      ),
    ]

    await QuoteManager.removeCorridors(Number(id), user.id, parsedCorridorIds)
    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.REMOVE_CORRIDORS,
    })
  }
}
