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
        router.post('/', [controllers.Quote, 'store'])
        router.get('/', [controllers.Quote, 'index'])
        router.get('/:id', [controllers.Quote, 'show'])
        router.patch('/:id', [controllers.Quote, 'update'])
        router.delete('/:id', [controllers.Quote, 'destroy'])
        router.get('/:id/corridors', [controllers.Quote, 'listCorridors'])
        router.post('/:id/corridors', [controllers.Quote, 'attachCorridors'])
        router.patch('/:id/corridors/:corridorId', [controllers.Quote, 'updateCorridor'])
        router.delete('/:id/corridors', [controllers.Quote, 'removeCorridors'])
      })
      .prefix('quotes')
      .as('quotes')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
