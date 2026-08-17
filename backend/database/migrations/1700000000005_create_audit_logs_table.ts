import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'audit_logs'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.string('action').notNullable()
            table.string('entity_type').notNullable()
            table.integer('entity_id').notNullable()
            table.json('changes').nullable()
            table.string('ip_address').nullable()
            table.text('user_agent').nullable()
            table
                .integer('user_id')
                .unsigned()
                .nullable()
                .references('id')
                .inTable('users')
                .onDelete('SET NULL')

            table.timestamp('created_at').notNullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}