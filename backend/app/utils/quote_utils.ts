import type Quote from '#models/quote'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'
import QuoteRepository from '../repositories/quote_repository.ts'

export default class QuoteUtils {
  static async getQuote(id: number, ownerId: number): Promise<Quote> {
    const quote = await QuoteRepository.getByIdAndOwner(id, ownerId)

    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    return quote
  }

  static async getQuotesByOwner(ownerId: number): Promise<Quote[]> {
    return QuoteRepository.getAllByOwner(ownerId)
  }

  static async deleteQuote(id: number): Promise<void> {
    const quote = await QuoteRepository.getById(id)

    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    await QuoteRepository.delete(id)
  }

  static async assertQuoteExists(quoteId: number, trx: TransactionClientContract): Promise<Quote> {
    const quote = await QuoteRepository.getByIdWithTransaction(quoteId, trx)

    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    return quote
  }

  static async assertCorridorsNotAttached(
    quoteId: number,
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<void> {
    const attachedIds = await QuoteRepository.getAttachedCorridorIds(quoteId, corridorIds, trx)

    if (attachedIds.length > 0) {
      throw new Exception(QuoteMessages.ERROR.CORRIDORS_ALREADY_ATTACHED, ErrorCodes.CONFLICT)
    }
  }

  static async assertCorridorsAttached(
    quoteId: number,
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<void> {
    const attachedIds = await QuoteRepository.getAttachedCorridorIds(quoteId, corridorIds, trx)

    if (attachedIds.length !== corridorIds.length) {
      throw new Exception(QuoteMessages.ERROR.CORRIDORS_NOT_ATTACHED, ErrorCodes.BAD_REQUEST)
    }
  }
}
