import { QuoteCorridorSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Quote from '#models/quote'
import Corridor from '#models/corridor'

export default class QuoteCorridor extends QuoteCorridorSchema {
  static table = 'quote_corridors'

  @belongsTo(() => Quote, { foreignKey: 'quoteId' })
  declare quote: BelongsTo<typeof Quote>

  @belongsTo(() => Corridor, { foreignKey: 'corridorId' })
  declare corridor: BelongsTo<typeof Corridor>
}

