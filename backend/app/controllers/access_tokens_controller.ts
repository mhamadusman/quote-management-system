import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth_validator'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.js'
import { SuccessCodes } from '../constants/success_codes.js'
import { AuthErrorMessages } from '../constants/messages/auth_error_messages.js'
import { AuthSuccessMessages } from '../constants/messages/auth_success_messages.js'

export default class AccessTokensController {
  async store({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password).catch(() => {
      throw new Exception(AuthErrorMessages.LOGIN.INVALID_CREDENTIALS, ErrorCodes.UNAUTHORIZED)
    })

    // Creates the session and attaches the adonis-session cookie automatically
    await auth.use('web').login(user)

    return response.status(SuccessCodes.OK).send({
      message: AuthSuccessMessages.LOGIN_SUCCESS,
      data: { user },
    })
  }

  async destroy({ auth, response }: HttpContext) {
    // Destroys the server session and clears the cookie
    await auth.use('web').logout()

    return response.status(SuccessCodes.OK).send({
      message: AuthSuccessMessages.LOGOUT_SUCCESS,
    })
  }
}
