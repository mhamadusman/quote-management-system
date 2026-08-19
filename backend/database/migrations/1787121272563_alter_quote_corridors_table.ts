import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quote_corridors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['quote_id', 'corridor_id'], 'quote_corridors_quote_id_corridor_id_unique')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['quote_id', 'corridor_id'], 'quote_corridors_quote_id_corridor_id_unique')
    })
  }
}
