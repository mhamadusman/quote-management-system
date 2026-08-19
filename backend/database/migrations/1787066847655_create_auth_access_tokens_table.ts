import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').nullable()
      table.bigInteger('tokenable_id').notNullable().unsigned()
      table.string('type').notNullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable().defaultTo('*')
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
