import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quote_corridors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('quote_id')
        .unsigned()
        .references('id')
        .inTable('quotes')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('corridor_id')
        .references('id')
        .inTable('corridors')
        .onDelete('CASCADE')
        .notNullable()
      table.decimal('override_std_fixed_fee_usd', 15, 4).nullable()
      table.decimal('override_variable_fee_percentage', 8, 4).nullable()
      table.decimal('revenue', 15, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
