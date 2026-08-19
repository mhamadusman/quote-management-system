import type Quote from '#models/quote'
import db from '@adonisjs/lucid/services/db'
import QuoteUtils from '../utils/quote_utils.ts'
import CorridorUtils from '../utils/corridor_utils.ts'
import QuoteRepository from '../repositories/quote_repository.ts'

export default class QuoteManager {
  static async getQuote(id: number, ownerId: number): Promise<Quote> {
    return QuoteUtils.getQuote(id, ownerId)
  }

  static async getQuotesByOwner(ownerId: number): Promise<Quote[]> {
    return QuoteUtils.getQuotesByOwner(ownerId)
  }

  static async deleteQuote(id: number, ownerId: number): Promise<void> {
    return QuoteUtils.deleteQuote(id, ownerId)
  }

  static async attachCorridors(
    quoteId: number,
    ownerId: number,
    corridorIds: string[]
  ): Promise<void> {
    await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      const corridors = await CorridorUtils.assertCorridorsExist(corridorIds, trx)
      await QuoteUtils.assertCorridorsNotAttached(quoteId, corridorIds, trx)

      await QuoteRepository.attachCorridors(quote, corridors, trx)
      await QuoteRepository.recalculateQuote(quoteId, trx)
    })
  }

  static async removeCorridors(
    quoteId: number,
    ownerId: number,
    corridorIds: string[]
  ): Promise<void> {
    await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      await QuoteUtils.assertCorridorsAttached(quoteId, corridorIds, trx)

      await QuoteRepository.detachCorridors(quote, corridorIds, trx)
      await QuoteRepository.recalculateQuote(quoteId, trx)
    })
  }
}
