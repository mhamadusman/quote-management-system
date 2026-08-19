import Quote from '#models/quote'
import db from '@adonisjs/lucid/services/db'
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
    const sets: string[] = []
    const bindings: (string | number)[] = []

    if (payload.name !== undefined) {
      sets.push('name = ?')
      bindings.push(payload.name)
    }
    if (payload.partnerName !== undefined) {
      sets.push('partner_name = ?')
      bindings.push(payload.partnerName)
    }
    if (payload.contractLength !== undefined) {
      sets.push('contract_length = ?')
      bindings.push(payload.contractLength)
    }
    if (payload.status !== undefined) {
      sets.push('status = ?')
      bindings.push(payload.status)
    }

    if (sets.length === 0) return

    if (bumpVersion) sets.push('version = version + 1')
    sets.push('updated_at = NOW()')

    bindings.push(quoteId)

    await trx.rawQuery(
      `UPDATE quotes SET ${sets.join(', ')} WHERE id = ?`,
      bindings
    )
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
      const sets: string[] = []
      const bindings: (string | number)[] = []

      if (override.overrideStdFixedFeeUsd !== undefined) {
        sets.push('override_std_fixed_fee_usd = ?')
        bindings.push(override.overrideStdFixedFeeUsd)
      }
      if (override.overrideVariableFeePercentage !== undefined) {
        sets.push('override_variable_fee_percentage = ?')
        bindings.push(override.overrideVariableFeePercentage)
      }

      if (sets.length === 0) continue

      sets.push('updated_at = NOW()')
      bindings.push(quoteId, override.corridorId)

      await trx.rawQuery(
        `UPDATE quote_corridors SET ${sets.join(', ')} WHERE quote_id = ? AND corridor_id = ?`,
        bindings
      )
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
    const sets: string[] = []
    const bindings: (string | number)[] = []

    if (override.overrideStdFixedFeeUsd !== undefined) {
      sets.push('override_std_fixed_fee_usd = ?')
      bindings.push(override.overrideStdFixedFeeUsd)
    }
    if (override.overrideVariableFeePercentage !== undefined) {
      sets.push('override_variable_fee_percentage = ?')
      bindings.push(override.overrideVariableFeePercentage)
    }

    if (sets.length === 0) return

    sets.push('updated_at = NOW()')
    bindings.push(quoteId, corridorId)

    await trx.rawQuery(
      `UPDATE quote_corridors SET ${sets.join(', ')} WHERE quote_id = ? AND corridor_id = ?`,
      bindings
    )
  }

  static async getAttachedCorridorsWithCalcs(
    quoteId: number
  ): Promise<Record<string, unknown>[]> {
    const result = await db.rawQuery(
      `
      SELECT
        c.id,
        c.version_id          AS "versionId",
        c.region,
        c.country,
        c.transaction_type    AS "transactionType",
        c.service,
        c.receiving_partner   AS "receivingPartner",
        c.payer,
        c.payout_currency     AS "payoutCurrency",
        c.historical_atv      AS "historicalAtv",
        c.atv_usd             AS "atvUsd",
        c.std_fixed_fee_usd   AS "stdFixedFeeUsd",
        c.variable_fee_percentage AS "variableFeePercentage",
        c.fx_source           AS "fxSource",
        c.default_fx_spread   AS "defaultFxSpread",
        c.treasury_fx_cost    AS "treasuryFxCost",
        c.cost_fixed_per_usd  AS "costFixedPerUsd",
        c.cost_variable_per_trx AS "costVariablePerTrx",
        c.needs_approval      AS "needsApproval",
        qc.override_std_fixed_fee_usd      AS "overrideStdFixedFeeUsd",
        qc.override_variable_fee_percentage AS "overrideVariableFeePercentage",
        -- Effective rates: use override if present, otherwise fall back to original corridor value
        COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd) AS "effectiveFixedFeeUsd",
        COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) AS "effectiveVariableFeePercentage",
        -- Per-corridor calculations (yearlyVolumeUSD = 100000)
        (
          COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
          * CEIL(100000.0 / c.atv_usd)
          + COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0
          * 100000
        ) AS revenue,
        (
          c.cost_fixed_per_usd * 100000
          + c.cost_variable_per_trx * CEIL(100000.0 / c.atv_usd)
        ) AS cost,
        (
          (COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
           * CEIL(100000.0 / c.atv_usd)
           + COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0
           * 100000)
          -
          (c.cost_fixed_per_usd * 100000
           + c.cost_variable_per_trx * CEIL(100000.0 / c.atv_usd))
        ) AS margin,
        CASE
          WHEN (
            COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
            * CEIL(100000.0 / c.atv_usd)
            + COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0
            * 100000
          ) = 0 THEN 0
          ELSE (
            (
              (COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
               * CEIL(100000.0 / c.atv_usd)
               + COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0
               * 100000)
              -
              (c.cost_fixed_per_usd * 100000
               + c.cost_variable_per_trx * CEIL(100000.0 / c.atv_usd))
            )
            /
            (
              COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
              * CEIL(100000.0 / c.atv_usd)
              + COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0
              * 100000
            ) * 100
          )
        END AS "marginPercent"
      FROM quote_corridors qc
      INNER JOIN corridors c ON c.id = qc.corridor_id
      WHERE qc.quote_id = ?
      ORDER BY c.id
      `,
      [quoteId]
    )
    return result.rows ?? []
  }

  static async recalculateQuote(quoteId: number, trx: TransactionClientContract): Promise<void> {
    await trx.rawQuery(
      `
  UPDATE quotes
  SET
    total_revenue = COALESCE((
      SELECT SUM(
        (
          COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
          *
          CEIL(100000.0 / c.atv_usd)
        )
        +
        (
          (COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0)
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
          COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
          *
          CEIL(100000.0 / c.atv_usd)
        )
        +
        (
          (COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0)
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
          COALESCE(qc.override_std_fixed_fee_usd, c.std_fixed_fee_usd)
          *
          CEIL(100000.0 / c.atv_usd)
        )
        +
        (
          (COALESCE(qc.override_variable_fee_percentage, c.variable_fee_percentage) / 100.0)
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
