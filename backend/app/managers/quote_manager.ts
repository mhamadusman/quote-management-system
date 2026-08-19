import QuoteUtils from '../utils/quote_utils.ts'
import db from '@adonisjs/lucid/services/db'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteRepository from '../repositories/quote_repository.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'
import { ErrorCodes } from '../constants/error_codes.ts'
import { Exception } from '#exceptions/exception'

export default class QuoteManager {
  static async getQuote(id: number, ownerId: number): Promise<Quote> {
    return QuoteUtils.getQuote(id, ownerId)
  }

  static async getQuotesByOwner(ownerId: number): Promise<Quote[]> {
    return QuoteUtils.getQuotesByOwner(ownerId)
  }

  static async deleteQuote(id: number): Promise<void> {
    return QuoteUtils.deleteQuote(id)
  }

  static async attachCorridors(quoteId: number, corridorIds: string[]): Promise<void> {
    const [quote, corridors] = await Promise.all([
      Quote.find(quoteId),
      Corridor.query()
        .whereIn('id', corridorIds)
        .select('id', 'atvUsd', 'stdFixedFeeUsd', 'variableFeePercentage'),
    ])
    console.log('details :: ', corridors)

    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    if (corridors.length !== corridorIds.length) {
      throw new Exception(QuoteMessages.ERROR.CORRIDORS_NOT_FOUND, ErrorCodes.NOT_FOUND)
    }

    await db.transaction(async (trx) => {
      await QuoteRepository.attachCorridors(quote, corridors, trx)

      await QuoteRepository.recalculateQuote(quoteId, trx)
    })
  }
}
