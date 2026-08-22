import AuditLog from '#models/audit_log'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export interface CreateAuditLogPayload {
  userId: number
  action: string
  entityType: string
  entityId: number
  changes?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export default class AuditLogRepository {
  static async create(
    payload: CreateAuditLogPayload,
    trx?: TransactionClientContract
  ): Promise<AuditLog> {
    return AuditLog.create(
      {
        userId: payload.userId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        changes: payload.changes ?? null,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ?? null,
      },
      trx ? { client: trx } : undefined
    )
  }

  static async getAllByUserId(userId: number): Promise<AuditLog[]> {
    return AuditLog.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
  }

  static async getAll(): Promise<AuditLog[]> {
    return AuditLog.query()
      .preload('user', (query) => query.select('id', 'fullName', 'email'))
      .orderBy('createdAt', 'desc')
  }
}
