import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import db from '@adonisjs/lucid/services/db'
import type { Registry } from '../.adonisjs/client/registry/schema.d.ts'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */
declare module '@japa/api-client/types' {
  interface RoutesRegistry extends Registry {}
}

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  dbAssertions(app),
  apiClient(),
  sessionApiClient(app),
  authApiClient(app),
]

/**
 * Setup: drop all tables (clean slate), run migrations, run seeders.
 * Teardown: handled by bin/test.ts (app.terminate closes DB connections).
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    async () => {
      const connection = db.connection()

      // Drop all tables for a clean slate (ensures seeders are idempotent)
      await connection.rawQuery('DROP SCHEMA public CASCADE')
      await connection.rawQuery('CREATE SCHEMA public')

      // Run all pending migrations
      const migrator = new MigrationRunner(db, app, {
        direction: 'up',
        connectionName: 'postgres',
        dryRun: false,
      })
      await migrator.run()

      // Run all seeders (user_seeder + corridor_seeder)
      const userSeederModule = await import('#database/seeders/user_seeder')
      const corridorSeederModule = await import('#database/seeders/corridor_seeder')
      await new userSeederModule.default(connection).run()
      await new corridorSeederModule.default(connection).run()
    },
  ],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
