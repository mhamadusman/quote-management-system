
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth_validator'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { AuthErrorMessages } from '../constants/messages/auth_error_messages.ts'
import { AuthSuccessMessages } from '../constants/messages/auth_success_messages.ts'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AccessTokenCookieOptions,
  ClearAccessTokenCookieOptions,
} from '../constants/cookie_options.ts'

export default class AccessTokensController {
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password).catch(() => {
      throw new Exception(AuthErrorMessages.LOGIN.INVALID_CREDENTIALS, ErrorCodes.UNAUTHORIZED)
    })

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '15 mins',
      name: 'login_token',
    })

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, token.value!.release(), AccessTokenCookieOptions)

    return response.status(SuccessCodes.OK).send({
      message: AuthSuccessMessages.LOGIN_SUCCESS,
      data: { user },
    })
  }
  async destroy({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, ClearAccessTokenCookieOptions)

    return response.status(SuccessCodes.OK).send({
      message: AuthSuccessMessages.LOGOUT_SUCCESS,
    })
  }
}