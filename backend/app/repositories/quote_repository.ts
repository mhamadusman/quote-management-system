import Quote from '#models/quote'
import QuoteCorridor from '#models/quote_corridor'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Corridor from '#models/corridor'
import QuoteCalcUtils from '../utils/quote_calc_utils.ts'

export default class QuoteRepository {
  static async create(payload: Partial<Quote>): Promise<Quote> {
    return Quote.create(payload)
  }

  static async getAll(): Promise<Quote[]> {
    return Quote.all()
  }

  static async getAllByOwner(ownerId: number): Promise<Quote[]> {
    return Quote.query().where('ownerId', ownerId)
  }

  static async getById(id: number): Promise<Quote | null> {
    return Quote.find(id)
  }

  static async getByIdAndOwner(id: number, ownerId: number): Promise<Quote | null> {
    return Quote.query().where('id', id).where('ownerId', ownerId).first()
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

  static async updateGeneralDetails(
    quoteId: number,
    payload: {
      name?: string
      partnerName?: string
      contractLength?: number
      status?: string
    },
    trx: TransactionClientContract,
    bumpVersion: boolean
  ): Promise<void> {
    const quote = await Quote.query({ client: trx }).where('id', quoteId).first()
    if (!quote) return

    if (payload.name !== undefined) quote.name = payload.name
    if (payload.partnerName !== undefined) quote.partnerName = payload.partnerName
    if (payload.contractLength !== undefined) quote.contractLength = payload.contractLength
    if (payload.status !== undefined) quote.status = payload.status
    if (bumpVersion) quote.version = quote.version + 1

    await quote.save()
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

  static async getAttachedCorridorsWithCalcs(
    quoteId: number
  ): Promise<Record<string, unknown>[]> {
    const quoteCorridors = await QuoteCorridor.query()
      .where('quoteId', quoteId)
      .preload('corridor')
      .orderBy('corridorId', 'asc')

    return quoteCorridors.map((qc) => {
      const corridor = qc.corridor
      const calcs = QuoteCalcUtils.calculateCorridorMetrics(
        corridor,
        qc.overrideStdFixedFeeUsd,
        qc.overrideVariableFeePercentage
      )

      return {
        ...corridor.serialize(),
        overrideStdFixedFeeUsd: qc.overrideStdFixedFeeUsd,
        overrideVariableFeePercentage: qc.overrideVariableFeePercentage,
        effectiveFixedFeeUsd: calcs.effectiveFixedFeeUsd,
        effectiveVariableFeePercentage: calcs.effectiveVariableFeePercentage,
        revenue: calcs.revenue,
        cost: calcs.cost,
        margin: calcs.margin,
        marginPercent: calcs.marginPercent,
      }
    })
  }

  static async recalculateQuote(quoteId: number, trx: TransactionClientContract): Promise<void> {
    const quote = await Quote.query({ client: trx }).where('id', quoteId).first()
    if (!quote) return

    const quoteCorridors = await QuoteCorridor.query({ client: trx })
      .where('quoteId', quoteId)
      .preload('corridor')

    const totals = QuoteCalcUtils.calculateQuoteTotals(quoteCorridors, quote.contractLength)

    quote.totalRevenue = totals.totalRevenue.toString()
    quote.monthlyRevenue = totals.monthlyRevenue.toString()
    quote.tcv = totals.tcv.toString()
    quote.version = quote.version + 1

    await quote.save()
  }
}
