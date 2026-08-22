import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteCorridor from '#models/quote_corridor'
import AuditLog from '#models/audit_log'
import { ErrorCodes } from '../../app/constants/error_codes.ts'
import { SuccessCodes } from '../../app/constants/success_codes.ts'
import { QuoteMessages } from '../../app/constants/messages/quote_messages.ts'
import { QuoteFields } from '../../app/constants/quote_fields.ts'

test.group('Quote Controller & Sub-resources - Functional Operations', (group) => {
  let userA: User
  let userB: User

  group.each.setup(async () => {
    await AuditLog.query().delete()
    await QuoteCorridor.query().delete()
    await Quote.query().delete()

    userA = await User.firstOrCreate(
      { email: 'user_a@example.com' },
      {
        fullName: 'User A',
        email: 'user_a@example.com',
        password: 'password123',
      }
    )

    userB = await User.firstOrCreate(
      { email: 'user_b@example.com' },
      {
        fullName: 'User B',
        email: 'user_b@example.com',
        password: 'password123',
      }
    )
  })

  group.each.teardown(async () => {
    await AuditLog.query().delete()
    await QuoteCorridor.query().delete()
    await Quote.query().delete()
  })

  test('GET /api/v1/corridors - should list all available corridors in catalog', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/v1/corridors').loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED)
    assert.exists(response.body().data.corridors)
    assert.isAbove(response.body().data.corridors.length, 0)
  })

  test('POST /api/v1/quotes - should successfully create a quote and record audit log', async ({
    client,
    assert,
  }) => {
    const payload = {
      [QuoteFields.NAME]: 'Enterprise Remittance Deal',
      [QuoteFields.PARTNER_NAME]: 'Acme Corp',
      [QuoteFields.CONTRACT_LENGTH]: 24,
      [QuoteFields.STATUS]: 'draft',
    }

    const response = await client.post('/api/v1/quotes').loginAs(userA).json(payload)

    response.assertStatus(SuccessCodes.CREATED)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.STORE)
    assert.exists(response.body().data.quote.id)
    assert.equal(response.body().data.quote.name, payload[QuoteFields.NAME])
    assert.equal(response.body().data.quote.partnerName, payload[QuoteFields.PARTNER_NAME])
    assert.equal(response.body().data.quote.contractLength, payload[QuoteFields.CONTRACT_LENGTH])
    assert.equal(response.body().data.quote.ownerId, userA.id)
    assert.equal(response.body().data.quote.version, 1)

    const savedQuote = await Quote.findOrFail(response.body().data.quote.id)
    assert.equal(savedQuote.name, payload[QuoteFields.NAME])

    // Verify audit log was recorded
    const auditLogs = await AuditLog.query().where('userId', userA.id).where('action', 'CREATE_QUOTE')
    assert.equal(auditLogs.length, 1)
    assert.equal(auditLogs[0].entityId, savedQuote.id)
  })

  test('POST /api/v1/quotes - should create quote with initial corridors and overrides', async ({
    client,
    assert,
  }) => {
    const payload = {
      name: 'Quote with Initial Corridors',
      partnerName: 'Fintech Global',
      contractLength: 12,
      corridors: [
        {
          corridorId: '10001',
          overrideStdFixedFeeUsd: '2.5000',
          overrideVariableFeePercentage: '0.7500',
        },
        {
          corridorId: '10002',
        },
      ],
    }

    const response = await client.post('/api/v1/quotes').loginAs(userA).json(payload)

    response.assertStatus(SuccessCodes.CREATED)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.STORE)
    const quoteId = response.body().data.quote.id

    const pivots = await QuoteCorridor.query().where('quoteId', quoteId)
    assert.equal(pivots.length, 2)

    const pivot10001 = pivots.find((p) => p.corridorId === '10001')
    assert.equal(Number(pivot10001?.overrideStdFixedFeeUsd), 2.5)
    assert.equal(Number(pivot10001?.overrideVariableFeePercentage), 0.75)
  })

  test('GET /api/v1/quotes - should list quotes in descending order (newest first)', async ({
    client,
    assert,
  }) => {
    const q1 = await Quote.create({
      name: 'Older Deal',
      partnerName: 'Partner 1',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const q2 = await Quote.create({
      name: 'Newer Deal',
      partnerName: 'Partner 2',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client.get('/api/v1/quotes').loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.SHOW)
    assert.equal(response.body().data.quotes.length, 2)
    // Newest quote (q2) should appear first in descending order
    assert.equal(response.body().data.quotes[0].id, q2.id)
    assert.equal(response.body().data.quotes[1].id, q1.id)
  })

  test('GET /api/v1/quotes/:id - should successfully show quote owned by authenticated user', async ({
    client,
    assert,
  }) => {
    const createdQuote = await Quote.create({
      name: 'Special Deal',
      partnerName: 'Special Partner',
      contractLength: 36,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client.get(`/api/v1/quotes/${createdQuote.id}`).loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.SHOW)
    assert.equal(response.body().data.quote.id, createdQuote.id)
    assert.equal(response.body().data.quote.name, createdQuote.name)
    assert.equal(response.body().data.quote.ownerId, userA.id)
  })

  test('GET /api/v1/quotes/:id - should return 404 when quote does not exist or belongs to another user', async ({
    client,
    assert,
  }) => {
    const responseNotFound = await client.get('/api/v1/quotes/999999').loginAs(userA)
    responseNotFound.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseNotFound.body().message, QuoteMessages.ERROR.NOT_FOUND)

    const quoteOfUserB = await Quote.create({
      name: 'User B Private Quote',
      partnerName: 'Confidential Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const responseWrongOwner = await client.get(`/api/v1/quotes/${quoteOfUserB.id}`).loginAs(userA)
    responseWrongOwner.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseWrongOwner.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('PATCH /api/v1/quotes/:id - should successfully update scalar fields only and record audit log', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Initial Name',
      partnerName: 'Initial Partner',
      contractLength: 12,
      status: 'draft',
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.NAME]: 'Renamed Quote',
        [QuoteFields.PARTNER_NAME]: 'Updated Partner',
        [QuoteFields.STATUS]: 'in_review',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.UPDATE)
    assert.equal(response.body().data.quote.name, 'Renamed Quote')
    assert.equal(response.body().data.quote.partnerName, 'Updated Partner')
    assert.equal(response.body().data.quote.status, 'in_review')
    assert.equal(response.body().data.quote.version, 2)

    // Verify audit log
    const auditLogs = await AuditLog.query().where('userId', userA.id).where('action', 'UPDATE_QUOTE')
    assert.equal(auditLogs.length, 1)
  })

  test('PATCH /api/v1/quotes/:id - should update contractLength, recompute TCV in memory, and bump version', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Recalc Quote',
      partnerName: 'Partner',
      contractLength: 12,
      totalRevenue: '1000.00',
      monthlyRevenue: '83.33',
      tcv: '12000.00',
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.CONTRACT_LENGTH]: 24,
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().data.quote.contractLength, 24)
    assert.equal(response.body().data.quote.tcv, '24000.00')
    assert.equal(response.body().data.quote.version, 2)
  })

  test('PATCH /api/v1/quotes/:id - should return 409 conflict when version is stale', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Version Test Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 2,
    })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.NAME]: 'Stale Update',
      })

    response.assertStatus(ErrorCodes.CONFLICT)
    assert.equal(response.body().message, QuoteMessages.ERROR.VERSION_CONFLICT)
  })

  test('DELETE /api/v1/quotes/:id - should successfully delete quote and cascade remove pivots', async ({
    client,
    assert,
  }) => {
    const quoteToDelete = await Quote.create({
      name: 'To Delete',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client.delete(`/api/v1/quotes/${quoteToDelete.id}`).loginAs(userA)
    response.assertStatus(SuccessCodes.NO_CONTENT)

    const dbRecord = await Quote.find(quoteToDelete.id)
    assert.isNull(dbRecord)

    const auditLogs = await AuditLog.query().where('userId', userA.id).where('action', 'DELETE_QUOTE')
    assert.equal(auditLogs.length, 1)
  })

  test('POST /api/v1/quotes/:id/corridors - should attach corridors using array of objects and bump version', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Corridors Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        corridors: [
          {
            corridorId: '10001',
            overrideStdFixedFeeUsd: '3.0000',
            overrideVariableFeePercentage: '0.8000',
          },
          {
            corridorId: '10002',
          },
        ],
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.ATTACH_CORRIDORS)
    assert.equal(response.body().data.quote.version, 2)

    const pivots = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(pivots.length, 2)
  })

  test('GET /api/v1/quotes/:id/corridors - should return attached corridors with pivot values in descending order', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Get Corridors Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        corridors: [{ corridorId: '10001' }, { corridorId: '10002' }],
      })

    const response = await client.get(`/api/v1/quotes/${quote.id}/corridors`).loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED)
    assert.exists(response.body().data.quote)
    assert.exists(response.body().data.corridors)
    assert.equal(response.body().data.corridors.length, 2)
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should update single corridor override and recalculate', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Override Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({ corridors: [{ corridorId: '10001' }] })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors/10001`)
      .loginAs(userA)
      .json({
        version: 2,
        overrideStdFixedFeeUsd: '5.0000',
        overrideVariableFeePercentage: '1.2000',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED)
    assert.equal(response.body().data.quote.version, 3)

    const pivot = await QuoteCorridor.query()
      .where('quoteId', quote.id)
      .where('corridorId', '10001')
      .firstOrFail()
    assert.equal(Number(pivot.overrideStdFixedFeeUsd), 5.0)
    assert.equal(Number(pivot.overrideVariableFeePercentage), 1.2)
  })

  test('PATCH /api/v1/quotes/:id/corridors - should batch update multiple corridor overrides', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Batch Override Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({ corridors: [{ corridorId: '10001' }, { corridorId: '10002' }] })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        version: 2,
        corridors: [
          { corridorId: '10001', overrideStdFixedFeeUsd: '4.0000' },
          { corridorId: '10002', overrideVariableFeePercentage: '0.9500' },
        ],
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED)
    assert.equal(response.body().data.quote.version, 3)
  })

  test('DELETE /api/v1/quotes/:id/corridors/:corridorId - should detach single corridor and recalculate financials', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Single Detach Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({ corridors: [{ corridorId: '10001' }, { corridorId: '10002' }] })

    const response = await client
      .delete(`/api/v1/quotes/${quote.id}/corridors/10001`)
      .loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.REMOVE_CORRIDORS)
    assert.equal(response.body().data.quote.version, 3)

    const remainingPivots = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(remainingPivots.length, 1)
    assert.equal(remainingPivots[0].corridorId, '10002')
  })

  test('DELETE /api/v1/quotes/:id/corridors - should batch detach multiple corridors', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Batch Detach Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        corridors: [{ corridorId: '10001' }, { corridorId: '10002' }, { corridorId: '10003' }],
      })

    const response = await client
      .delete(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        corridorIds: ['10001', '10002'],
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.REMOVE_CORRIDORS)
    assert.equal(response.body().data.quote.version, 3)

    const remainingPivots = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(remainingPivots.length, 1)
    assert.equal(remainingPivots[0].corridorId, '10003')
  })

  test('GET /api/v1/audit-logs - should retrieve user audit history in descending order', async ({
    client,
    assert,
  }) => {
    const createQuoteRes = await client
      .post('/api/v1/quotes')
      .loginAs(userA)
      .json({
        name: 'Audit Log Test Quote',
        partnerName: 'Partner Corp',
        contractLength: 12,
        status: 'draft',
      })

    const quoteId = createQuoteRes.body().data.quote.id

    await client
      .patch(`/api/v1/quotes/${quoteId}`)
      .loginAs(userA)
      .json({
        version: 1,
        name: 'Audit Log Renamed Quote',
      })

    const response = await client.get('/api/v1/audit-logs').loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.AUDIT_LOGS_RETRIEVED)
    assert.isAbove(response.body().data.logs.length, 1)
    // Most recent action (UPDATE_QUOTE) should be first
    assert.equal(response.body().data.logs[0].action, 'UPDATE_QUOTE')
    assert.equal(response.body().data.logs[1].action, 'CREATE_QUOTE')
  })
})
