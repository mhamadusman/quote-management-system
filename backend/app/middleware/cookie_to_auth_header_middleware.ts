import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ACCESS_TOKEN_COOKIE_NAME } from '../constants/cookie_options.js'

export default class CookieToAuthHeaderMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authorizationHeader = ctx.request.header('authorization')

    if (!authorizationHeader) {
      const tokenFromCookie = ctx.request.encryptedCookie(ACCESS_TOKEN_COOKIE_NAME)

      if (tokenFromCookie && typeof tokenFromCookie === 'string') {
        ctx.request.request.headers.authorization = `Bearer ${tokenFromCookie}`
      }
    }

    return next()
  }
}
