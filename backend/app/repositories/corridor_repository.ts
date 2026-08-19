import Corridor from '#models/corridor'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class CorridorRepository {
  static async getByIds(
    corridorIds: string[],
    trx: TransactionClientContract
  ): Promise<Corridor[]> {
    return Corridor.query({ client: trx })
      .whereIn('id', corridorIds)
      .select('id', 'atvUsd', 'stdFixedFeeUsd', 'variableFeePercentage')
  }

  static async getAll(): Promise<Corridor[]> {
    return Corridor.query().orderBy('id', 'asc')
  }
}
