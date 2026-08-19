import type Quote from '#models/quote'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'
import QuoteUtils from '../utils/quote_utils.ts'
import CorridorUtils from '../utils/corridor_utils.ts'
import QuoteRepository from '../repositories/quote_repository.ts'

type GeneralDetails = {
  name?: string
  partnerName?: string
  contractLength?: number
  status?: string
}

type CorridorOverride = {
  overrideStdFixedFeeUsd?: string
  overrideVariableFeePercentage?: string
}

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

  static async updateQuote(
    quoteId: number,
    ownerId: number,
    clientVersion: number,
    generalDetails: GeneralDetails
  ): Promise<Quote> {
    await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      QuoteUtils.assertQuoteVersion(quote, clientVersion)

      const contractLengthChanged = generalDetails.contractLength !== undefined

      await QuoteRepository.updateGeneralDetails(
        quoteId,
        generalDetails,
        trx,
        !contractLengthChanged
      )

      if (contractLengthChanged) {
        await QuoteRepository.recalculateQuote(quoteId, trx)
      }
    })

    const quote = await QuoteRepository.getByIdAndOwner(quoteId, ownerId)
    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }
    return quote
  }

  static async updateCorridorOverride(
    quoteId: number,
    ownerId: number,
    corridorId: string,
    clientVersion: number,
    override: CorridorOverride
  ): Promise<Quote> {
    await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      QuoteUtils.assertQuoteVersion(quote, clientVersion)

      await QuoteUtils.assertCorridorsAttached(quoteId, [corridorId], trx)

      await QuoteRepository.updateSingleCorridorOverride(quoteId, corridorId, override, trx)
      await QuoteRepository.recalculateQuote(quoteId, trx)
    })

    const quote = await QuoteRepository.getByIdAndOwner(quoteId, ownerId)
    if (!quote) {
      throw new Exception(QuoteMessages.ERROR.NOT_FOUND, ErrorCodes.NOT_FOUND)
    }
    return quote
  }

  static async getAttachedCorridors(
    quoteId: number,
    ownerId: number
  ): Promise<Record<string, unknown>[]> {
    await QuoteUtils.getQuote(quoteId, ownerId)
    return QuoteRepository.getAttachedCorridorsWithCalcs(quoteId)
  }
}
