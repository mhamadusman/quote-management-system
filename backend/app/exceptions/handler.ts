// app/exceptions/handler.ts
import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as authErrors } from '@adonisjs/auth'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const { response } = ctx

    if (error instanceof Exception) {
      return response.status(error.status).send({
        message: error.message || 'Something went wrong',
        errors: error.errors || [],
      })
    }

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(ErrorCodes.UNPROCESSABLE_ENTITY).send({
        message: 'Validation Failed',
        errors: error.messages,
      })
    }

    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      return response.status(ErrorCodes.UNAUTHORIZED).send({
        message: error.message,
      })
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      return response.status(ErrorCodes.UNAUTHORIZED).send({
        message: error.message,
      })
    }

    // ANY unexpected error — DB failures, null refs, anything not already
    // one of the two known types above — lands here automatically.
    // No controller needs to catch it, wrap it, or know about this fallback.
    return response.status(ErrorCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Internal server error',
    })
  }

  async report(error: unknown, ctx: HttpContext) {
    // ONE centralized logging point for every error, from every controller,
    // across the entire app — this replaces every scattered console.error
    console.error(`[${ctx.request.method()}] ${ctx.request.url()} ::`, error)
    return super.report(error, ctx)
  }
}
