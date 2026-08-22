import type { HttpContext } from '@adonisjs/core/http'
import {
  quoteIdValidator,
  corridorParamValidator,
  attachQuoteCorridorsValidator,
  updateSingleCorridorOverrideValidator,
  batchUpdateCorridorsValidator,
  batchRemoveCorridorsValidator,
} from '#validators/quote_validator'
import QuoteManager from '../managers/quote_manager.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

export default class QuoteCorridorsController {
  // Get all corridors attached to a quote with their latest pivot overrides and quote totals
  async index({ params, response, auth }: HttpContext) {
    const { id } = await quoteIdValidator.validate({ id: params.id })
    const user = auth.getUserOrFail()

    const data = await QuoteManager.getAttachedCorridors(id, user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED,
      data,
    })
  }

  // Attach one or more corridors with optional initial overrides
  async attach({ params, request, response, auth }: HttpContext) {
    const validated = await attachQuoteCorridorsValidator.validate({
      id: params.id,
      ...request.body(),
    })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.attachCorridors(
      validated.id,
      user.id,
      validated.corridors,
      validated.version,
      {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      }
    )

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.ATTACH_CORRIDORS,
      data: { quote },
    })
  }

  // Update override rates for a single corridor
  async updateSingle({ params, request, response, auth }: HttpContext) {
    const validated = await updateSingleCorridorOverrideValidator.validate({
      id: params.id,
      corridorId: params.corridorId,
      ...request.body(),
    })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.updateCorridorOverride(
      validated.id,
      user.id,
      validated.corridorId,
      validated.version,
      {
        overrideStdFixedFeeUsd: validated.overrideStdFixedFeeUsd,
        overrideVariableFeePercentage: validated.overrideVariableFeePercentage,
      },
      {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      }
    )

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED,
      data: { quote },
    })
  }

  // Batch update override rates for multiple or all attached corridors
  async updateBatch({ params, request, response, auth }: HttpContext) {
    const validated = await batchUpdateCorridorsValidator.validate({
      id: params.id,
      ...request.body(),
    })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.batchUpdateCorridorOverrides(
      validated.id,
      user.id,
      validated.version,
      validated.corridors,
      {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      }
    )

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED,
      data: { quote },
    })
  }

  // Detach a single corridor from a quote
  async destroySingle({ params, request, response, auth }: HttpContext) {
    const validated = await corridorParamValidator.validate({
      id: params.id,
      corridorId: params.corridorId,
    })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.removeCorridor(validated.id, user.id, validated.corridorId, {
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.REMOVE_CORRIDORS,
      data: { quote },
    })
  }

  // Detach multiple corridors from a quote in a single call
  async destroyBatch({ params, request, response, auth }: HttpContext) {
    const validated = await batchRemoveCorridorsValidator.validate({
      id: params.id,
      ...request.body(),
    })
    const user = auth.getUserOrFail()

    const quote = await QuoteManager.removeCorridors(validated.id, user.id, validated.corridorIds, {
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.REMOVE_CORRIDORS,
      data: { quote },
    })
  }
}
