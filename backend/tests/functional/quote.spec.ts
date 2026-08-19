import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteCorridor from '#models/quote_corridor'
import { ErrorCodes } from '../../app/constants/error_codes.ts'
import { SuccessCodes } from '../../app/constants/success_codes.ts'
import { QuoteMessages } from '../../app/constants/messages/quote_messages.ts'
import { QuoteFields } from '../../app/constants/quote_fields.ts'

test.group('Quote Controller - Logical Operations', (group) => {
  let userA: User
  let userB: User

  group.each.setup(async () => {
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
    await QuoteCorridor.query().delete()
    await Quote.query().delete()
  })

  test('GET /api/v1/corridors - should list all available corridors', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/v1/corridors').loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED)
    assert.exists(response.body().data.corridors)
    assert.isAbove(response.body().data.corridors.length, 0)
  })

  test('POST /api/v1/quotes - should successfully create a quote and persist in database', async ({
    client,
    assert,
  }) => {
    const payload = {
      [QuoteFields.NAME]: 'Enterprise Remittance Deal',
      [QuoteFields.PARTNER_NAME]: 'Acme Corp',
      [QuoteFields.CONTRACT_LENGTH]: 24,
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
    assert.equal(savedQuote.partnerName, payload[QuoteFields.PARTNER_NAME])
    assert.equal(savedQuote.contractLength, payload[QuoteFields.CONTRACT_LENGTH])
    assert.equal(savedQuote.ownerId, userA.id)
    assert.equal(savedQuote.version, 1)
  })

  test('GET /api/v1/quotes - should list only quotes owned by the authenticated user', async ({
    client,
    assert,
  }) => {
    await Quote.create({
      name: 'User A Deal 1',
      partnerName: 'Partner 1',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await Quote.create({
      name: 'User A Deal 2',
      partnerName: 'Partner 2',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await Quote.create({
      name: 'User B Deal',
      partnerName: 'Partner 3',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const response = await client.get('/api/v1/quotes').loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.SHOW)
    assert.equal(response.body().data.quotes.length, 2)
    assert.isTrue(
      response.body().data.quotes.every((q: { ownerId: number }) => q.ownerId === userA.id)
    )
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

  test('GET /api/v1/quotes/:id - should return 404 when quote does not exist', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/v1/quotes/999999').loginAs(userA)

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('GET /api/v1/quotes/:id - should return 404 when quote is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Private Quote',
      partnerName: 'Confidential Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const response = await client.get(`/api/v1/quotes/${quoteOfUserB.id}`).loginAs(userA)

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('PATCH /api/v1/quotes/:id - should successfully update general quote details when version matches', async ({
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

    const updated = await Quote.findOrFail(quote.id)
    assert.equal(updated.name, 'Renamed Quote')
    assert.equal(updated.partnerName, 'Updated Partner')
    assert.equal(updated.status, 'in_review')
    assert.equal(updated.version, 2)
  })

  test('PATCH /api/v1/quotes/:id - should update contractLength, trigger recalculation, and increment version', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote With Corridor For Recalc',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const quoteAfterAttach = await Quote.findOrFail(quote.id)
    assert.equal(quoteAfterAttach.version, 2)

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 2,
        [QuoteFields.CONTRACT_LENGTH]: 24,
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.UPDATE)
    assert.equal(response.body().data.quote.contractLength, 24)
    assert.equal(response.body().data.quote.version, 3)
    assert.isAbove(Number(response.body().data.quote.tcv), Number(quoteAfterAttach.tcv))
  })

  test('PATCH /api/v1/quotes/:id - should return 409 conflict when version does not match', async ({
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

  test('PATCH /api/v1/quotes/:id - should return 404 when quote does not exist or is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const responseNotFound = await client
      .patch('/api/v1/quotes/999999')
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.NAME]: 'New Name',
      })
    responseNotFound.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseNotFound.body().message, QuoteMessages.ERROR.NOT_FOUND)

    const responseWrongOwner = await client
      .patch(`/api/v1/quotes/${quoteOfUserB.id}`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.NAME]: 'New Name',
      })
    responseWrongOwner.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseWrongOwner.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('DELETE /api/v1/quotes/:id - should successfully delete quote and remove from database', async ({
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
  })

  test('DELETE /api/v1/quotes/:id - should return 404 when trying to delete non-existing quote', async ({
    client,
    assert,
  }) => {
    const response = await client.delete('/api/v1/quotes/999999').loginAs(userA)

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('DELETE /api/v1/quotes/:id - should return 404 when trying to delete quote owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const response = await client.delete(`/api/v1/quotes/${quoteOfUserB.id}`).loginAs(userA)

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)

    const dbRecord = await Quote.find(quoteOfUserB.id)
    assert.isNotNull(dbRecord)
  })

  test('POST /api/v1/quotes/:id/corridors - should successfully attach a single corridor and recalculate quote financials', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Single Corridor Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const corridor = await Corridor.findOrFail('10000')

    const response = await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: corridor.id,
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.ATTACH_CORRIDORS)

    const pivotRecord = await QuoteCorridor.query()
      .where('quoteId', quote.id)
      .where('corridorId', corridor.id)
      .firstOrFail()

    assert.equal(pivotRecord.overrideStdFixedFeeUsd, corridor.stdFixedFeeUsd)
    assert.equal(pivotRecord.overrideVariableFeePercentage, corridor.variableFeePercentage)

    const updatedQuote = await Quote.findOrFail(quote.id)
    assert.equal(updatedQuote.version, 2)
    assert.isNotNull(updatedQuote.totalRevenue)
    assert.isNotNull(updatedQuote.monthlyRevenue)
    assert.isNotNull(updatedQuote.tcv)
    assert.notEqual(updatedQuote.totalRevenue, '0')
    assert.notEqual(updatedQuote.monthlyRevenue, '0')
    assert.notEqual(updatedQuote.tcv, '0')
  })

  test('POST /api/v1/quotes/:id/corridors - should successfully attach multiple corridors with deduplication and calculate combined financials', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Multi Corridor Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000,10001,10000',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.ATTACH_CORRIDORS)

    const pivotRows = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(pivotRows.length, 2)

    const updatedQuote = await Quote.findOrFail(quote.id)
    assert.equal(updatedQuote.version, 2)
    assert.isNotNull(updatedQuote.totalRevenue)
    assert.isNotNull(updatedQuote.monthlyRevenue)
    assert.isNotNull(updatedQuote.tcv)
  })

  test('GET /api/v1/quotes/:id - should return quote with updated version and financials after corridor attachment', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote With Corridors',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const response = await client.get(`/api/v1/quotes/${quote.id}`).loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.SHOW)
    assert.equal(response.body().data.quote.id, quote.id)
    assert.equal(response.body().data.quote.version, 2)
    assert.notEqual(response.body().data.quote.totalRevenue, '0')
  })

  test('GET /api/v1/quotes/:id/corridors - should return attached corridors with calculated revenue, cost and margin', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote Attached Corridors With Calcs',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const response = await client.get(`/api/v1/quotes/${quote.id}/corridors`).loginAs(userA)

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED)
    assert.exists(response.body().data.corridors)
    assert.equal(response.body().data.corridors.length, 1)
    assert.equal(response.body().data.corridors[0].id, '10000')
    assert.exists(response.body().data.corridors[0].revenue)
    assert.exists(response.body().data.corridors[0].cost)
    assert.exists(response.body().data.corridors[0].margin)
  })

  test('GET /api/v1/quotes/:id/corridors - should return 404 when quote does not exist or is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const responseNotFound = await client.get('/api/v1/quotes/999999/corridors').loginAs(userA)
    responseNotFound.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseNotFound.body().message, QuoteMessages.ERROR.NOT_FOUND)

    const responseWrongOwner = await client
      .get(`/api/v1/quotes/${quoteOfUserB.id}/corridors`)
      .loginAs(userA)
    responseWrongOwner.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseWrongOwner.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should update corridor override rates, recalculate quote financials, and increment version', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote Override Update Test',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const quoteBeforeOverride = await Quote.findOrFail(quote.id)
    assert.equal(quoteBeforeOverride.version, 2)

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors/10000`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 2,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '5.0',
        [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: '2.5',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED)
    assert.equal(response.body().data.quote.version, 3)
    assert.isAbove(
      Number(response.body().data.quote.totalRevenue),
      Number(quoteBeforeOverride.totalRevenue)
    )

    const pivotRecord = await QuoteCorridor.query()
      .where('quoteId', quote.id)
      .where('corridorId', '10000')
      .firstOrFail()

    assert.equal(Number(pivotRecord.overrideStdFixedFeeUsd), 5.0)
    assert.equal(Number(pivotRecord.overrideVariableFeePercentage), 2.5)
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should return 409 conflict when version is stale', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Stale Version Override Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors/10000`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '3.0',
      })

    response.assertStatus(ErrorCodes.CONFLICT)
    assert.equal(response.body().message, QuoteMessages.ERROR.VERSION_CONFLICT)
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should return 400 when corridor is not attached to quote', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote Without 10001 Attached',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors/10001`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '3.0',
      })

    response.assertStatus(ErrorCodes.BAD_REQUEST)
    assert.equal(response.body().message, QuoteMessages.ERROR.CORRIDORS_NOT_ATTACHED)
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should return 404 when quote does not exist or is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const responseNotFound = await client
      .patch('/api/v1/quotes/999999/corridors/10000')
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '3.0',
      })
    responseNotFound.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseNotFound.body().message, QuoteMessages.ERROR.NOT_FOUND)

    const responseWrongOwner = await client
      .patch(`/api/v1/quotes/${quoteOfUserB.id}/corridors/10000`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 1,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '3.0',
      })
    responseWrongOwner.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(responseWrongOwner.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('POST /api/v1/quotes/:id/corridors - should return 404 when quote does not exist', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes/999999/corridors')
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('POST /api/v1/quotes/:id/corridors - should return 404 when quote is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const response = await client
      .post(`/api/v1/quotes/${quoteOfUserB.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('POST /api/v1/quotes/:id/corridors - should return 404 when one or more corridors do not exist', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote For Non Existing Corridor',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '999999',
      })

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.CORRIDORS_NOT_FOUND)
  })

  test('POST /api/v1/quotes/:id/corridors - should return 409 when corridor is already attached', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote For Already Attached',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const response = await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.CONFLICT)
    assert.equal(response.body().message, QuoteMessages.ERROR.CORRIDORS_ALREADY_ATTACHED)
  })

  test('DELETE /api/v1/quotes/:id/corridors - should partially detach corridors and recalculate remaining financials', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote To Partially Detach',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000,10001',
      })

    const response = await client
      .delete(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.REMOVE_CORRIDORS)

    const remainingPivots = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(remainingPivots.length, 1)
    assert.equal(remainingPivots[0].corridorId, '10001')

    const updatedQuote = await Quote.findOrFail(quote.id)
    assert.equal(updatedQuote.version, 3)
    assert.notEqual(updatedQuote.totalRevenue, '0')
  })

  test('DELETE /api/v1/quotes/:id/corridors - should fully detach all corridors and reset financials to zero', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote To Fully Detach',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    const response = await client
      .delete(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(SuccessCodes.OK)
    assert.equal(response.body().message, QuoteMessages.SUCCESS.REMOVE_CORRIDORS)

    const remainingPivots = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(remainingPivots.length, 0)

    const updatedQuote = await Quote.findOrFail(quote.id)
    assert.equal(updatedQuote.version, 3)
    assert.equal(Number(updatedQuote.totalRevenue), 0)
    assert.equal(Number(updatedQuote.monthlyRevenue), 0)
    assert.equal(Number(updatedQuote.tcv), 0)
  })

  test('DELETE /api/v1/quotes/:id/corridors - should return 404 when quote does not exist', async ({
    client,
    assert,
  }) => {
    const response = await client
      .delete('/api/v1/quotes/999999/corridors')
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('DELETE /api/v1/quotes/:id/corridors - should return 404 when quote is owned by another user', async ({
    client,
    assert,
  }) => {
    const quoteOfUserB = await Quote.create({
      name: 'User B Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userB.id,
      version: 1,
    })

    const response = await client
      .delete(`/api/v1/quotes/${quoteOfUserB.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.NOT_FOUND)
    assert.equal(response.body().message, QuoteMessages.ERROR.NOT_FOUND)
  })

  test('DELETE /api/v1/quotes/:id/corridors - should return 400 when corridors are not attached to quote', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Quote With No Attached Corridors',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const response = await client
      .delete(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000',
      })

    response.assertStatus(ErrorCodes.BAD_REQUEST)
    assert.equal(response.body().message, QuoteMessages.ERROR.CORRIDORS_NOT_ATTACHED)
  })

  test('Concurrency - should serialize simultaneous corridor attachments with row-level locks and produce consistent version and financials', async ({
    client,
    assert,
  }) => {
    const quote = await Quote.create({
      name: 'Concurrent Locking Quote',
      partnerName: 'Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    const [res1, res2] = await Promise.all([
      client
        .post(`/api/v1/quotes/${quote.id}/corridors`)
        .loginAs(userA)
        .json({ [QuoteFields.CORRIDOR_IDS]: '10000' }),
      client
        .post(`/api/v1/quotes/${quote.id}/corridors`)
        .loginAs(userA)
        .json({ [QuoteFields.CORRIDOR_IDS]: '10001' }),
    ])

    res1.assertStatus(SuccessCodes.OK)
    res2.assertStatus(SuccessCodes.OK)

    const attachedCorridors = await QuoteCorridor.query().where('quoteId', quote.id)
    assert.equal(attachedCorridors.length, 2)

    const finalQuote = await Quote.findOrFail(quote.id)
    assert.equal(finalQuote.version, 3)
    assert.isAbove(Number(finalQuote.totalRevenue), 0)
    assert.isAbove(Number(finalQuote.monthlyRevenue), 0)
    assert.isAbove(Number(finalQuote.tcv), 0)
  })

  test('Multi-Corridor Flow - should update specific corridor rates in pivot, recalculate quote financials, return effective rates in listCorridors, and keep base corridor table untouched', async ({
    client,
    assert,
  }) => {
    const originalCorridor10000 = await Corridor.findOrFail('10000')
    const originalCorridor10001 = await Corridor.findOrFail('10001')

    const quote = await Quote.create({
      name: 'Multi Corridor Full Lifecycle',
      partnerName: 'Enterprise Partner',
      contractLength: 12,
      ownerId: userA.id,
      version: 1,
    })

    await client
      .post(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)
      .json({
        [QuoteFields.CORRIDOR_IDS]: '10000,10001',
      })

    const quoteAfterAttach = await Quote.findOrFail(quote.id)
    assert.equal(quoteAfterAttach.version, 2)

    const updateResponse = await client
      .patch(`/api/v1/quotes/${quote.id}/corridors/10000`)
      .loginAs(userA)
      .json({
        [QuoteFields.VERSION]: 2,
        [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '8.5',
        [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: '3.2',
      })

    updateResponse.assertStatus(SuccessCodes.OK)
    assert.equal(
      updateResponse.body().message,
      QuoteMessages.SUCCESS.CORRIDOR_OVERRIDE_UPDATED
    )
    assert.equal(updateResponse.body().data.quote.version, 3)
    assert.isAbove(
      Number(updateResponse.body().data.quote.totalRevenue),
      Number(quoteAfterAttach.totalRevenue)
    )

    const pivot10000 = await QuoteCorridor.query()
      .where('quoteId', quote.id)
      .where('corridorId', '10000')
      .firstOrFail()
    assert.equal(Number(pivot10000.overrideStdFixedFeeUsd), 8.5)
    assert.equal(Number(pivot10000.overrideVariableFeePercentage), 3.2)

    const pivot10001 = await QuoteCorridor.query()
      .where('quoteId', quote.id)
      .where('corridorId', '10001')
      .firstOrFail()
    assert.equal(
      pivot10001.overrideStdFixedFeeUsd,
      originalCorridor10001.stdFixedFeeUsd
    )
    assert.equal(
      pivot10001.overrideVariableFeePercentage,
      originalCorridor10001.variableFeePercentage
    )

    const listResponse = await client
      .get(`/api/v1/quotes/${quote.id}/corridors`)
      .loginAs(userA)

    listResponse.assertStatus(SuccessCodes.OK)
    assert.equal(
      listResponse.body().message,
      QuoteMessages.SUCCESS.CORRIDORS_RETRIEVED
    )
    assert.equal(listResponse.body().data.corridors.length, 2)

    const item10000 = listResponse
      .body()
      .data.corridors.find((c: { id: string }) => c.id === '10000')
    assert.equal(Number(item10000.effectiveFixedFeeUsd), 8.5)
    assert.equal(Number(item10000.effectiveVariableFeePercentage), 3.2)
    assert.equal(Number(item10000.overrideStdFixedFeeUsd), 8.5)
    assert.equal(Number(item10000.overrideVariableFeePercentage), 3.2)

    const item10001 = listResponse
      .body()
      .data.corridors.find((c: { id: string }) => c.id === '10001')
    assert.equal(
      item10001.effectiveFixedFeeUsd,
      originalCorridor10001.stdFixedFeeUsd
    )
    assert.equal(
      item10001.effectiveVariableFeePercentage,
      originalCorridor10001.variableFeePercentage
    )

    const baseCorridor10000After = await Corridor.findOrFail('10000')
    assert.equal(
      baseCorridor10000After.stdFixedFeeUsd,
      originalCorridor10000.stdFixedFeeUsd
    )
    assert.equal(
      baseCorridor10000After.variableFeePercentage,
      originalCorridor10000.variableFeePercentage
    )
  })
})
