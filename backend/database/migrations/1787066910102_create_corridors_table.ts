import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'corridors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary()
      table.integer('version_id').notNullable()
      table.string('source_row_id').notNullable()
      table.string('region').notNullable()
      table.string('country').notNullable()
      table.string('transaction_type').notNullable()
      table.string('service').notNullable()
      table.string('receiving_partner').notNullable()
      table.string('payer').notNullable()
      table.string('payout_currency').notNullable()
      table.decimal('historical_atv', 15, 2).notNullable()
      table.decimal('atv_usd', 15, 2).notNullable()
      table.decimal('std_fixed_fee_usd', 15, 4).notNullable()
      table.decimal('variable_fee_percentage', 8, 4).notNullable()
      table.string('fx_source').notNullable()
      table.decimal('default_fx_spread', 8, 4).notNullable()
      table.decimal('treasury_fx_cost', 8, 4).notNullable()
      table.decimal('cost_fixed_per_usd', 15, 4).notNullable()
      table.decimal('cost_variable_per_trx', 15, 4).notNullable()
      table.boolean('needs_approval').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
