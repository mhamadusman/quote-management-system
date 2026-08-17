
import { Exception as AdonisException } from '@adonisjs/core/exceptions'
import { ErrorCodes } from '../constants/error_codes.js'
import type { ValidationError } from '../types/types.js'
export class Exception extends AdonisException {
  public readonly errors?: ValidationError[]

  constructor(message: string | ValidationError[], statusCode: ErrorCodes) {
    const baseMessage = Array.isArray(message) ? 'Validation Failed' : message

    super(baseMessage, { status: statusCode, code: 'E_EXCEPTION' })

    if (Array.isArray(message)) {
      this.errors = message
    }
  }
}