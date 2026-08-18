import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'
import CorridorRepository from '../repositories/corridor_repository.ts'

export default class CorridorUtils {
  static async checkCorridorsExist(corridorIds: string[]): Promise<void> {
    const corridors = await CorridorRepository.getByIds(corridorIds)

    if (corridors.length !== corridorIds.length) {
      throw new Exception(QuoteMessages.ERROR.CORRIDORS_NOT_FOUND, ErrorCodes.NOT_FOUND)
    }
  }
}
