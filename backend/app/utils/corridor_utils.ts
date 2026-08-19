import type Corridor from '#models/corridor'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'
import CorridorRepository from '../repositories/corridor_repository.ts'

export default class CorridorUtils {
  static async assertCorridorsExist(
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<Corridor[]> {
    const corridors = await CorridorRepository.getByIds(corridorIds, trx)

    if (corridors.length !== corridorIds.length) {
      throw new Exception(QuoteMessages.ERROR.CORRIDORS_NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    return corridors
  }
}
