import type Quote from '#models/quote'
import QuoteUtils from '../utils/quote_utils.ts'

export default class QuoteManager {
  static async getQuote(id: number): Promise<Quote> {
    return QuoteUtils.getQuote(id)
  }

  static async deleteQuote(id: number): Promise<void> {
    return QuoteUtils.deleteQuote(id)
  }
}
