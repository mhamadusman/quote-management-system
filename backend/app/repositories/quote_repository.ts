import Quote from '#models/quote'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Corridor from '#models/corridor'

export default class QuoteRepository {
  static async create(payload: Partial<Quote>): Promise<Quote> {
    return Quote.create(payload)
  }

  static async getAll(): Promise<Quote[]> {
    return Quote.all()
  }

  static async getAllByOwner(ownerId: number): Promise<Quote[]> {
    return Quote.query().where('ownerId', ownerId).preload('corridors')
  }

  static async getById(id: number): Promise<Quote | null> {
    return Quote.find(id)
  }

  static async getByIdAndOwner(id: number, ownerId: number): Promise<Quote | null> {
    return Quote.query()
      .where('id', id)
      .where('ownerId', ownerId)
      .preload('corridors')
      .first()
  }

  static async delete(id: number): Promise<void> {
    const quote = await Quote.find(id)
    if (quote) {
      await quote.delete()
    }
  }

  static async attachCorridors(
    quote: Quote,
    corridors: Corridor[],
    trx: TransactionClientContract
  ): Promise<void> {
    const pivotData = Object.fromEntries(
      corridors.map((corridor) => [
        corridor.id,
        {
          override_std_fixed_fee_usd: corridor.stdFixedFeeUsd,
          override_variable_fee_percentage: corridor.variableFeePercentage,
        },
      ])
    )

    quote.useTransaction(trx)

    await quote.related('corridors').attach(pivotData)
  }

  static async recalculateQuote(quoteId: number, trx: TransactionClientContract): Promise<void> {
    await trx.rawQuery(
      `
  UPDATE quotes q
  SET
    total_revenue = COALESCE(calculated.total_revenue, 0),
    monthly_revenue = COALESCE(
      calculated.total_revenue / 12,
      0
    ),
    tcv = COALESCE(
      calculated.total_revenue * q.contract_length,
      0
    ),
    version = q.version + 1,
    updated_at = NOW()
  FROM (
    SELECT
      qc.quote_id,
      SUM(
        (
          qc.override_std_fixed_fee_usd
          *
          CEIL(100000.0 / c.atv_usd)
        )
        +
        (
          (qc.override_variable_fee_percentage / 100.0)
          *
          100000
        )
      ) AS total_revenue
    FROM quote_corridors qc
    INNER JOIN corridors c
      ON c.id = qc.corridor_id
    WHERE qc.quote_id = ?
    GROUP BY qc.quote_id
  ) calculated
  WHERE q.id = ?
  `,
      [quoteId, quoteId]
    )
  }
}
