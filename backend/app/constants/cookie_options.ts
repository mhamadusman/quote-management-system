
import app from '@adonisjs/core/services/app'

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token'

export const AccessTokenCookieOptions = {
  httpOnly: true,
  secure: app.inProduction,
  sameSite: 'lax' as const,
  maxAge: 15 * 60, // 15 minutes, in seconds
  path: '/',
}


export const ClearAccessTokenCookieOptions = {
  path: '/',
}