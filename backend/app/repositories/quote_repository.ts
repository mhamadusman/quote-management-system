import Quote from '#models/quote'

export default class QuoteRepository {
  static async create(payload: Partial<Quote>): Promise<Quote> {
    return Quote.create(payload)
  }

  static async getAll(): Promise<Quote[]> {
    return Quote.all()
  }

  static async getById(id: number): Promise<Quote | null> {
    return Quote.find(id)
  }

  static async delete(id: number): Promise<void> {
    const quote = await Quote.find(id)
    if (quote) {
      await quote.delete()
    }
  }
}
