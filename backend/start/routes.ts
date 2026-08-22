/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const QuoteCorridorsController = () => import('#controllers/quote_corridors_controller')
const AuditLogsController = () => import('#controllers/audit_logs_controller')

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Corridor, 'index'])
      })
      .prefix('corridors')
      .as('corridors')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [AuditLogsController, 'index'])
      })
      .prefix('audit-logs')
      .as('audit_logs')
      .use(middleware.auth())

    router
      .group(() => {
        // Quote core entity routes
        router.post('/', [controllers.Quote, 'store'])
        router.get('/', [controllers.Quote, 'index'])
        router.get('/:id', [controllers.Quote, 'show'])
        router.patch('/:id', [controllers.Quote, 'update'])
        router.delete('/:id', [controllers.Quote, 'destroy'])

        // Quote corridors sub-resource routes
        router.get('/:id/corridors', [QuoteCorridorsController, 'index'])
        router.post('/:id/corridors', [QuoteCorridorsController, 'attach'])
        router.patch('/:id/corridors/:corridorId', [QuoteCorridorsController, 'updateSingle'])
        router.patch('/:id/corridors', [QuoteCorridorsController, 'updateBatch'])
        router.delete('/:id/corridors/:corridorId', [QuoteCorridorsController, 'destroySingle'])
        router.delete('/:id/corridors', [QuoteCorridorsController, 'destroyBatch'])
      })
      .prefix('quotes')
      .as('quotes')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
