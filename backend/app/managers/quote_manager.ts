import type Quote from '#models/quote'
import type Corridor from '#models/corridor'
import db from '@adonisjs/lucid/services/db'
import QuoteUtils from '../utils/quote_utils.ts'
import CorridorUtils from '../utils/corridor_utils.ts'
import QuoteRepository from '../repositories/quote_repository.ts'
import AuditLogRepository from '../repositories/audit_log_repository.ts'
import QuoteCalcUtils from '../utils/quote_calc_utils.ts'

type UpdateQuotePayload = {
  name?: string
  partnerName?: string
  contractLength?: number
  status?: 'draft' | 'in_review' | 'approved' | 'rejected'
}

type CorridorInput = {
  corridorId: string
  overrideStdFixedFeeUsd?: string
  overrideVariableFeePercentage?: string
}

type CorridorOverride = {
  overrideStdFixedFeeUsd?: string
  overrideVariableFeePercentage?: string
}

type AuditContext = {
  ipAddress?: string | null
  userAgent?: string | null
}

export default class QuoteManager {
  // Create quote with pre-computed financials in an optimized single-pass database transaction
  static async createQuote(
    payload: Partial<Quote>,
    corridorsInput?: CorridorInput[],
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      let totalRevenue = '0.00'
      let monthlyRevenue = '0.00'
      let tcv = '0.00'
      let corridors: Corridor[] = []
      let overridesMap:
        | Map<string, { overrideStdFixedFeeUsd?: string; overrideVariableFeePercentage?: string }>
        | undefined

      // 1. If corridors are provided, validate existence and compute revenue metrics upfront in-memory
      if (corridorsInput && corridorsInput.length > 0) {
        // Extract unique, trimmed corridor IDs
        const corridorIds = [
          ...new Set(corridorsInput.map((c) => c.corridorId.trim()).filter(Boolean)),
        ]

        // Assert all requested corridors exist in the database (single SELECT)
        corridors = await CorridorUtils.assertCorridorsExist(corridorIds, trx)

        // Build a map of user-supplied overrides keyed by corridorId
        overridesMap = new Map(
          corridorsInput.map((c) => [
            c.corridorId.trim(),
            {
              overrideStdFixedFeeUsd: c.overrideStdFixedFeeUsd,
              overrideVariableFeePercentage: c.overrideVariableFeePercentage,
            },
          ])
        )

        // Calculate aggregate revenue metrics in-memory using QuoteCalcUtils
        const totals = QuoteCalcUtils.calculateTotalsFromCorridors(
          corridors,
          overridesMap,
          payload.contractLength ?? 0
        )

        totalRevenue = totals.totalRevenue.toFixed(2)
        monthlyRevenue = totals.monthlyRevenue.toFixed(2)
        tcv = totals.tcv.toFixed(2)
      }

      // 2. Insert the quote in ONE query with pre-computed financials and version = 1
      const quote = await QuoteRepository.create(
        {
          ...payload,
          totalRevenue,
          monthlyRevenue,
          tcv,
          version: 1,
        },
        trx
      )

      // 3. Batch attach corridors to junction table if corridors were provided
      if (corridors.length > 0) {
        await QuoteRepository.attachCorridors(quote, corridors, trx, overridesMap)
      }

      // 4. Record audit log
      if (payload.ownerId) {
        await AuditLogRepository.create(
          {
            userId: payload.ownerId,
            action: 'CREATE_QUOTE',
            entityType: 'quote',
            entityId: quote.id,
            changes: {
              name: quote.name,
              partnerName: quote.partnerName,
              contractLength: quote.contractLength,
              status: quote.status,
              corridorsCount: corridors.length,
              totalRevenue: quote.totalRevenue,
              monthlyRevenue: quote.monthlyRevenue,
              tcv: quote.tcv,
            },
            ipAddress: auditContext?.ipAddress,
            userAgent: auditContext?.userAgent,
          },
          trx
        )
      }

      return quote
    })
  }

  static async getQuote(id: number, ownerId: number): Promise<Quote> {
    return QuoteUtils.getQuote(id, ownerId)
  }

  static async getQuotesByOwner(ownerId: number): Promise<Quote[]> {
    return QuoteUtils.getQuotesByOwner(ownerId)
  }

  static async deleteQuote(id: number, ownerId: number, auditContext?: AuditContext): Promise<void> {
    const quote = await QuoteUtils.getQuote(id, ownerId)

    await db.transaction(async (trx) => {
      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'DELETE_QUOTE',
          entityType: 'quote',
          entityId: id,
          changes: {
            name: quote.name,
            partnerName: quote.partnerName,
            contractLength: quote.contractLength,
            status: quote.status,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      await QuoteRepository.delete(quote)
    })
  }

  // Update quote general scalar fields only (2 DB queries total inside transaction)
  static async updateQuote(
    quoteId: number,
    ownerId: number,
    clientVersion: number,
    payload: UpdateQuotePayload,
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      // 1. Lock quote and assert existence and ownership (Query 1: SELECT FOR UPDATE)
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)

      // 2. Validate client version for optimistic concurrency control
      QuoteUtils.assertQuoteVersion(quote, clientVersion)

      const previousState = {
        name: quote.name,
        partnerName: quote.partnerName,
        contractLength: quote.contractLength,
        status: quote.status,
        version: quote.version,
        tcv: quote.tcv,
      }

      // 3. Update scalar fields in memory
      if (payload.name !== undefined) quote.name = payload.name
      if (payload.partnerName !== undefined) quote.partnerName = payload.partnerName
      if (payload.status !== undefined) quote.status = payload.status

      if (payload.contractLength !== undefined && payload.contractLength !== quote.contractLength) {
        quote.contractLength = payload.contractLength
        const currentTotal = Number(quote.totalRevenue) || 0
        quote.tcv = (currentTotal * quote.contractLength).toFixed(2)
      }

      // 4. Increment version and persist changes (Query 2: UPDATE quotes)
      quote.version = quote.version + 1
      quote.useTransaction(trx)
      await quote.save()

      // 5. Record audit log
      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'UPDATE_QUOTE',
          entityType: 'quote',
          entityId: quote.id,
          changes: {
            previous: previousState,
            updated: {
              name: quote.name,
              partnerName: quote.partnerName,
              contractLength: quote.contractLength,
              status: quote.status,
              version: quote.version,
              tcv: quote.tcv,
            },
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return quote
    })
  }

  // Retrieve attached corridors with their latest pivot override values and quote totals
  static async getAttachedCorridors(
    quoteId: number,
    ownerId: number
  ): Promise<{
    quote: {
      id: number
      name: string
      partnerName: string
      totalRevenue: string
      monthlyRevenue: string
      tcv: string
      version: number
      contractLength: number
      status: string
    }
    corridors: Record<string, unknown>[]
  }> {
    const quote = await QuoteUtils.getQuote(quoteId, ownerId)
    const corridors = await QuoteRepository.getAttachedCorridors(quoteId)

    return {
      quote: {
        id: quote.id,
        name: quote.name,
        partnerName: quote.partnerName,
        totalRevenue: quote.totalRevenue,
        monthlyRevenue: quote.monthlyRevenue,
        tcv: quote.tcv,
        version: quote.version,
        contractLength: quote.contractLength,
        status: quote.status,
      },
      corridors,
    }
  }

  // Attach corridors with optional custom overrides or default rates
  static async attachCorridors(
    quoteId: number,
    ownerId: number,
    corridorsInput: CorridorInput[],
    clientVersion?: number,
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)

      if (clientVersion !== undefined) {
        QuoteUtils.assertQuoteVersion(quote, clientVersion)
      }

      const corridorIds = [
        ...new Set(corridorsInput.map((c) => c.corridorId.trim()).filter(Boolean)),
      ]

      const corridors = await CorridorUtils.assertCorridorsExist(corridorIds, trx)
      await QuoteUtils.assertCorridorsNotAttached(quoteId, corridorIds, trx)

      const overridesMap = new Map(
        corridorsInput.map((c) => [
          c.corridorId.trim(),
          {
            overrideStdFixedFeeUsd: c.overrideStdFixedFeeUsd,
            overrideVariableFeePercentage: c.overrideVariableFeePercentage,
          },
        ])
      )

      await QuoteRepository.attachCorridors(quote, corridors, trx, overridesMap)
      const updatedQuote = await QuoteRepository.recalculateQuote(quoteId, trx)

      // Record audit log
      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'ATTACH_CORRIDORS',
          entityType: 'quote',
          entityId: quoteId,
          changes: {
            attachedCorridors: corridorsInput,
            version: updatedQuote.version,
            totalRevenue: updatedQuote.totalRevenue,
            monthlyRevenue: updatedQuote.monthlyRevenue,
            tcv: updatedQuote.tcv,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return updatedQuote
    })
  }

  // Detach a single corridor from a quote
  static async removeCorridor(
    quoteId: number,
    ownerId: number,
    corridorId: string,
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      await QuoteUtils.assertCorridorsAttached(quoteId, [corridorId], trx)
      await QuoteRepository.detachCorridors(quote, [corridorId], trx)
      const updatedQuote = await QuoteRepository.recalculateQuote(quoteId, trx)

      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'DETACH_CORRIDOR',
          entityType: 'quote',
          entityId: quoteId,
          changes: {
            detachedCorridorId: corridorId,
            version: updatedQuote.version,
            totalRevenue: updatedQuote.totalRevenue,
            monthlyRevenue: updatedQuote.monthlyRevenue,
            tcv: updatedQuote.tcv,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return updatedQuote
    })
  }

  // Detach multiple corridors from a quote in a single call
  static async removeCorridors(
    quoteId: number,
    ownerId: number,
    corridorIds: string[],
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      await QuoteUtils.assertCorridorsAttached(quoteId, corridorIds, trx)
      await QuoteRepository.detachCorridors(quote, corridorIds, trx)
      const updatedQuote = await QuoteRepository.recalculateQuote(quoteId, trx)

      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'DETACH_CORRIDORS',
          entityType: 'quote',
          entityId: quoteId,
          changes: {
            detachedCorridorIds: corridorIds,
            version: updatedQuote.version,
            totalRevenue: updatedQuote.totalRevenue,
            monthlyRevenue: updatedQuote.monthlyRevenue,
            tcv: updatedQuote.tcv,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return updatedQuote
    })
  }

  // Update a single corridor's rate overrides
  static async updateCorridorOverride(
    quoteId: number,
    ownerId: number,
    corridorId: string,
    clientVersion: number,
    override: CorridorOverride,
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      QuoteUtils.assertQuoteVersion(quote, clientVersion)
      await QuoteUtils.assertCorridorsAttached(quoteId, [corridorId], trx)
      await QuoteRepository.updateSingleCorridorOverride(quoteId, corridorId, override, trx)
      const updatedQuote = await QuoteRepository.recalculateQuote(quoteId, trx)

      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'UPDATE_CORRIDOR_OVERRIDE',
          entityType: 'quote',
          entityId: quoteId,
          changes: {
            corridorId,
            override,
            version: updatedQuote.version,
            totalRevenue: updatedQuote.totalRevenue,
            monthlyRevenue: updatedQuote.monthlyRevenue,
            tcv: updatedQuote.tcv,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return updatedQuote
    })
  }

  // Batch update multiple or all attached corridors' rate overrides
  static async batchUpdateCorridorOverrides(
    quoteId: number,
    ownerId: number,
    clientVersion: number,
    overrides: CorridorInput[],
    auditContext?: AuditContext
  ): Promise<Quote> {
    return await db.transaction(async (trx) => {
      const quote = await QuoteUtils.assertQuoteExists(quoteId, ownerId, trx)
      QuoteUtils.assertQuoteVersion(quote, clientVersion)

      const corridorIds = overrides.map((o) => o.corridorId.trim())
      await QuoteUtils.assertCorridorsAttached(quoteId, corridorIds, trx)

      await QuoteRepository.updateCorridorOverrides(quoteId, overrides, trx)
      const updatedQuote = await QuoteRepository.recalculateQuote(quoteId, trx)

      await AuditLogRepository.create(
        {
          userId: ownerId,
          action: 'BATCH_UPDATE_CORRIDOR_OVERRIDES',
          entityType: 'quote',
          entityId: quoteId,
          changes: {
            overrides,
            version: updatedQuote.version,
            totalRevenue: updatedQuote.totalRevenue,
            monthlyRevenue: updatedQuote.monthlyRevenue,
            tcv: updatedQuote.tcv,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        trx
      )

      return updatedQuote
    })
  }
}
