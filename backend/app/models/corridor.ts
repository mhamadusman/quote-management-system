import { CorridorSchema } from '#database/schema'
import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Quote from '#models/quote'
import QuoteCorridor from '#models/quote_corridor'

export default class Corridor extends CorridorSchema {
  @hasMany(() => QuoteCorridor, { foreignKey: 'corridorId' })
  declare quoteCorridors: HasMany<typeof QuoteCorridor>

  @manyToMany(() => Quote, {
    pivotTable: 'quote_corridors',
    localKey: 'id',
    pivotForeignKey: 'corridor_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'quote_id',
    pivotColumns: ['override_std_fixed_fee_usd', 'override_variable_fee_percentage'],
    pivotTimestamps: true,
  })
  declare quotes: ManyToMany<typeof Quote>
}
