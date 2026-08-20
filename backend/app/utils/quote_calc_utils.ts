import type Corridor from '#models/corridor'
import type QuoteCorridor from '#models/quote_corridor'

export interface CorridorCalculatedMetrics {
  overrideStdFixedFeeUsd: string | null
  overrideVariableFeePercentage: string | null
  effectiveFixedFeeUsd: string
  effectiveVariableFeePercentage: string
  revenue: number
  cost: number
  margin: number
  marginPercent: number
}

export interface QuoteTotals {
  totalRevenue: number
  monthlyRevenue: number
  tcv: number
}

export default class QuoteCalcUtils {
  static readonly DEFAULT_YEARLY_VOLUME_USD = 100_000

  static calculateCorridorMetrics(
    corridor: Corridor,
    overrideFixed?: string | null,
    overrideVariable?: string | null,
    yearlyVolume = this.DEFAULT_YEARLY_VOLUME_USD
  ): CorridorCalculatedMetrics {
    const effectiveFixedFeeUsd = overrideFixed ?? corridor.stdFixedFeeUsd
    const effectiveVariableFeePercentage = overrideVariable ?? corridor.variableFeePercentage

    const fixedFee = Number(effectiveFixedFeeUsd) || 0
    const varFee = Number(effectiveVariableFeePercentage) || 0
    const atvUsd = Number(corridor.atvUsd) || 1
    const trxCount = Math.ceil(yearlyVolume / atvUsd)

    const revenue = fixedFee * trxCount + (varFee / 100) * yearlyVolume
    const cost =
      Number(corridor.costFixedPerUsd || 0) * yearlyVolume +
      Number(corridor.costVariablePerTrx || 0) * trxCount
    const margin = revenue - cost
    const marginPercent = revenue === 0 ? 0 : (margin / revenue) * 100

    return {
      overrideStdFixedFeeUsd: overrideFixed ?? null,
      overrideVariableFeePercentage: overrideVariable ?? null,
      effectiveFixedFeeUsd,
      effectiveVariableFeePercentage,
      revenue,
      cost,
      margin,
      marginPercent,
    }
  }

  static calculateQuoteTotals(
    quoteCorridors: QuoteCorridor[],
    contractLength: number,
    yearlyVolume = this.DEFAULT_YEARLY_VOLUME_USD
  ): QuoteTotals {
    let totalRevenue = 0

    for (const qc of quoteCorridors) {
      if (!qc.corridor) continue
      const { revenue } = this.calculateCorridorMetrics(
        qc.corridor,
        qc.overrideStdFixedFeeUsd,
        qc.overrideVariableFeePercentage,
        yearlyVolume
      )
      totalRevenue += revenue
    }

    const monthlyRevenue = totalRevenue / 12
    const tcv = totalRevenue * (contractLength || 0)

    return {
      totalRevenue,
      monthlyRevenue,
      tcv,
    }
  }
}
