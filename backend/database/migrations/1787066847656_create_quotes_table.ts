import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quotes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table
        .integer('owner_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('partner_name').notNullable()
      table.integer('contract_length').notNullable()
      table
        .enum('status', ['draft', 'in_review', 'approved', 'rejected'])
        .notNullable()
        .defaultTo('draft')
      table.decimal('total_revenue', 15, 2).notNullable().defaultTo(0)
      table.decimal('monthly_revenue', 15, 2).notNullable().defaultTo(0)
      table.decimal('tcv', 15, 2).notNullable().defaultTo(0)
      table.integer('version').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
