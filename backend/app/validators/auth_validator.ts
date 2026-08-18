import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AuthErrorMessages } from '../constants/messages/auth_error_messages.js'

const passwordRule = vine.createRule((value: unknown, _, Field) => {
  if (typeof value !== 'string') return

  if (!/[a-z]/.test(value)) {
    Field.report(AuthErrorMessages.SIGNUP.PASSWORD_LOWERCASE, 'password_lowercase', Field)
  }
  if (!/[A-Z]/.test(value)) {
    Field.report(AuthErrorMessages.SIGNUP.PASSWORD_UPPERCASE, 'password_uppercase', Field)
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    Field.report(AuthErrorMessages.SIGNUP.PASSWORD_SPECIAL, 'password_special', Field)
  }
})

export const signupValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(80),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(8).use(passwordRule()),
    password_confirmation: vine.string().confirmed({ confirmationField: 'password' }),
  })
)

signupValidator.messagesProvider = new SimpleMessagesProvider({
  'fullName.required': 'Name is required',
  'fullName.minLength': 'Name must be at least 2 characters',
  'email.required': AuthErrorMessages.SIGNUP.EMAIL_REQUIRED,
  'email.email': AuthErrorMessages.SIGNUP.EMAIL_INVALID,
  'email.database.unique': AuthErrorMessages.SIGNUP.EMAIL_TAKEN,
  'password.required': AuthErrorMessages.SIGNUP.PASSWORD_REQUIRED,
  'password.minLength': AuthErrorMessages.SIGNUP.PASSWORD_MIN_LENGTH,
  'password_confirmation.required': AuthErrorMessages.SIGNUP.PASSWORD_CONFIRMATION_REQUIRED,
  'password_confirmation.confirmed': AuthErrorMessages.SIGNUP.PASSWORD_MISMATCH,
})

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(1),
  })
)

loginValidator.messagesProvider = new SimpleMessagesProvider({
  'email.required': AuthErrorMessages.LOGIN.EMAIL_REQUIRED,
  'email.email': AuthErrorMessages.LOGIN.EMAIL_INVALID,
  'password.required': AuthErrorMessages.LOGIN.PASSWORD_REQUIRED,
})
