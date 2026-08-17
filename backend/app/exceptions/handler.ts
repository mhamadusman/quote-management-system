import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { Exception } from '#exceptions/exception'
import { ErrorCodes } from '../constants/error_codes.ts'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const { response } = ctx

    console.error('actual error from request :: ', error)

    // your custom Exception — same shape as Express
    if (error instanceof Exception) {
      return response.status(error.status).send({
        message: error.message || 'Something went wrong',
        errors: error.errors || [],
      })
    }

    // VineJS validation errors — auto-thrown by request.validateUsing()
    // convert into the SAME shape your Exception class produces,
    // so the frontend only ever deals with ONE error format
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(ErrorCodes.UNPROCESSABLE_ENTITY).send({
        message: 'Validation Failed',
        errors: error.messages,
      })
    }

    // fallback — anything unhandled
    return response.status(ErrorCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Internal server error',
    })
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}