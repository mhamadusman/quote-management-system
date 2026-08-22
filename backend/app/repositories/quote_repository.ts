import Quote from '#models/quote'
import QuoteCorridor from '#models/quote_corridor'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Corridor from '#models/corridor'
import QuoteCalcUtils from '../utils/quote_calc_utils.ts'

export default class QuoteRepository {
  // Create a new quote record optionally within a transaction client
  static async create(payload: Partial<Quote>, trx?: TransactionClientContract): Promise<Quote> {
    return Quote.create(payload, trx ? { client: trx } : undefined)
  }

  static async getAll(): Promise<Quote[]> {
    return Quote.query().orderBy('createdAt', 'desc')
  }

  static async getAllByOwner(ownerId: number): Promise<Quote[]> {
    return Quote.query().where('ownerId', ownerId).orderBy('createdAt', 'desc')
  }

  static async getById(id: number): Promise<Quote | null> {
    return Quote.find(id)
  }

  static async getByIdAndOwner(
    id: number,
    ownerId: number,
    trx?: TransactionClientContract
  ): Promise<Quote | null> {
    const query = Quote.query(trx ? { client: trx } : undefined)
      .where('id', id)
      .where('ownerId', ownerId)

    return query.first()
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
    const rows = await QuoteCorridor.query({ client: trx })
      .where('quoteId', quoteId)
      .whereIn('corridorId', corridorIds)
      .select('corridorId')

    return rows.map((row) => row.corridorId)
  }

  static async delete(quote: Quote): Promise<void> {
    await quote.delete()
  }

  // Attach corridors to quote pivot table, using provided fee overrides or falling back to corridor default rates
  static async attachCorridors(
    quote: Quote,
    corridors: Corridor[],
    trx: TransactionClientContract,
    overrides?: Map<
      string,
      { overrideStdFixedFeeUsd?: string; overrideVariableFeePercentage?: string }
    >
  ): Promise<void> {
    const pivotData = Object.fromEntries(
      corridors.map((corridor) => {
        const override = overrides?.get(corridor.id)
        return [
          corridor.id,
          {
            override_std_fixed_fee_usd:
              override?.overrideStdFixedFeeUsd ?? corridor.stdFixedFeeUsd,
            override_variable_fee_percentage:
              override?.overrideVariableFeePercentage ?? corridor.variableFeePercentage,
          },
        ]
      })
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

  static async updateSingleCorridorOverride(
    quoteId: number,
    corridorId: string,
    override: {
      overrideStdFixedFeeUsd?: string
      overrideVariableFeePercentage?: string
    },
    trx: TransactionClientContract
  ): Promise<void> {
    const quoteCorridor = await QuoteCorridor.query({ client: trx })
      .where('quoteId', quoteId)
      .where('corridorId', corridorId)
      .first()

    if (!quoteCorridor) return

    if (override.overrideStdFixedFeeUsd !== undefined) {
      quoteCorridor.overrideStdFixedFeeUsd = override.overrideStdFixedFeeUsd
    }

    if (override.overrideVariableFeePercentage !== undefined) {
      quoteCorridor.overrideVariableFeePercentage = override.overrideVariableFeePercentage
    }

    await quoteCorridor.save()
  }

  static async updateCorridorOverrides(
    quoteId: number,
    overrides: Array<{
      corridorId: string
      overrideStdFixedFeeUsd?: string
      overrideVariableFeePercentage?: string
    }>,
    trx: TransactionClientContract
  ): Promise<void> {
    for (const override of overrides) {
      await this.updateSingleCorridorOverride(quoteId, override.corridorId, override, trx)
    }
  }

  // Retrieve attached corridors with their latest pivot override values in descending order
  static async getAttachedCorridors(quoteId: number): Promise<Record<string, unknown>[]> {
    const quoteCorridors = await QuoteCorridor.query()
      .where('quoteId', quoteId)
      .preload('corridor')
      .orderBy('createdAt', 'desc')

    return quoteCorridors.map((qc) => {
      const corridor = qc.corridor
      return {
        ...corridor.serialize(),
        overrideStdFixedFeeUsd: qc.overrideStdFixedFeeUsd,
        overrideVariableFeePercentage: qc.overrideVariableFeePercentage,
      }
    })
  }

  static async recalculateQuote(quoteId: number, trx: TransactionClientContract): Promise<Quote> {
    const quote = await Quote.query({ client: trx }).where('id', quoteId).firstOrFail()
    const quoteCorridors = await QuoteCorridor.query({ client: trx })
      .where('quoteId', quoteId)
      .preload('corridor')

    const totals = QuoteCalcUtils.calculateQuoteTotals(quoteCorridors, quote.contractLength)

    quote.totalRevenue = totals.totalRevenue.toFixed(2)
    quote.monthlyRevenue = totals.monthlyRevenue.toFixed(2)
    quote.tcv = totals.tcv.toFixed(2)
    quote.version = quote.version + 1

    await quote.save()
    return quote
  }
}
