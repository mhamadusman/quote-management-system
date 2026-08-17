import { QuoteSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import QuoteCorridor from '#models/quote_corridor'
import Corridor from '#models/corridor'

export default class Quote extends QuoteSchema {
    @belongsTo(() => User, { foreignKey: 'ownerId' })
    declare owner: BelongsTo<typeof User>

    @hasMany(() => QuoteCorridor, { foreignKey: 'quoteId' })
    declare quoteCorridors: HasMany<typeof QuoteCorridor>

    @manyToMany(() => Corridor, {
        pivotTable: 'quote_corridors',
        localKey: 'id',
        pivotForeignKey: 'quote_id',
        relatedKey: 'id',
        pivotRelatedForeignKey: 'corridor_id',
        pivotColumns: ['override_std_fixed_fee_usd', 'override_variable_fee_percentage', 'revenue'],
    })
    declare corridors: ManyToMany<typeof Corridor>
}