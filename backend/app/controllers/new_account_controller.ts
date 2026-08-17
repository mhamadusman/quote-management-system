// app/controllers/new_account_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { signupValidator } from '#validators/auth_validator'
import { AuthSuccessMessages } from '../constants/messages/auth_success_messages.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
export default class NewAccountController {
  async store({ request, response }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const user = await User.create({ fullName, email, password})

    return response.status(SuccessCodes.CREATED).send({
      message: AuthSuccessMessages.SIGNUP_SUCCESS,
      data: { user },
    })
  }
}