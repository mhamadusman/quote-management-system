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
            table.string('partner_name').nullable()
            table.integer('contract_length').nullable()
            table
                .enum('status', ['draft', 'in_review', 'approved', 'rejected'])
                .notNullable()
                .defaultTo('draft')
            table.decimal('total_revenue', 12, 2).notNullable().defaultTo(0)
            table.decimal('monthly_revenue', 12, 2).notNullable().defaultTo(0)
            table.decimal('tcv', 12, 2).notNullable().defaultTo(0)
            table.integer('version').notNullable().defaultTo(1)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}