import type Quote from '#models/quote'
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
}
