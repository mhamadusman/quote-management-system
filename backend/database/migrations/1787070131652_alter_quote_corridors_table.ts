import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quote_corridors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('revenue')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('revenue')
    })
  }
}
