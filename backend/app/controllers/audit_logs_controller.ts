import type { HttpContext } from '@adonisjs/core/http'
import AuditLogRepository from '../repositories/audit_log_repository.ts'
import { SuccessCodes } from '../constants/success_codes.ts'
import { QuoteMessages } from '../constants/messages/quote_messages.ts'

export default class AuditLogsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const logs = await AuditLogRepository.getAllByUserId(user.id)

    return response.status(SuccessCodes.OK).send({
      message: QuoteMessages.SUCCESS.AUDIT_LOGS_RETRIEVED,
      data: { logs },
    })
  }
}
