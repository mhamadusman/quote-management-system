import type { HttpContext } from '@adonisjs/core/http'
import CorridorRepository from '../repositories/corridor_repository.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

export default class CorridorController {
  async index({ response }: HttpContext) {
    const corridors = await CorridorRepository.getAll()

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED,
      data: { corridors },
    })
  }
}
