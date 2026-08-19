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
    return Quote.query().where('id', id).where('ownerId', ownerId).preload('corridors').first()
  }

  static async lockQuote(
    quoteId: number,
    ownerId: number,
    trx: TransactionClientContract
  ): Promise<Quote | null> {
    return Quote.query({ client: trx })
      .where('id', quoteId)
      .where('ownerId', ownerId)
      .forUpdate()
      .first()
  }

  static async getAttachedCorridorIds(
    quoteId: number,
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<string[]> {
    const rows = await trx
      .from('quote_corridors')
      .where('quote_id', quoteId)
      .whereIn('corridor_id', corridorIds)
      .select('corridor_id')

    return rows.map((row) => row.corridor_id)
  }

  static async delete(quote: Quote): Promise<void> {
    await quote.delete()
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

  static async detachCorridors(
    quote: Quote,
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<void> {
    quote.useTransaction(trx)
    await quote.related('corridors').detach(corridorIds)
  }

  static async recalculateQuote(quoteId: number, trx: TransactionClientContract): Promise<void> {
    await trx.rawQuery(
      `
  UPDATE quotes
  SET
    total_revenue = COALESCE((
      SELECT SUM(
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
      )
      FROM quote_corridors qc
      INNER JOIN corridors c
        ON c.id = qc.corridor_id
      WHERE qc.quote_id = ?
    ), 0),
    monthly_revenue = COALESCE((
      SELECT SUM(
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
      )
      FROM quote_corridors qc
      INNER JOIN corridors c
        ON c.id = qc.corridor_id
      WHERE qc.quote_id = ?
    ) / 12, 0),
    tcv = COALESCE((
      SELECT SUM(
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
      )
      FROM quote_corridors qc
      INNER JOIN corridors c
        ON c.id = qc.corridor_id
      WHERE qc.quote_id = ?
    ) * contract_length, 0),
    version = version + 1,
    updated_at = NOW()
  WHERE id = ?
  `,
      [quoteId, quoteId, quoteId, quoteId]
    )
  }
}
