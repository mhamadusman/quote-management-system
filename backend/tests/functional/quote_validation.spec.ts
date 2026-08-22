import { test } from '@japa/runner'
import User from '#models/user'
import { ErrorCodes } from '../../app/constants/error_codes.ts'
import { QuoteMessages } from '../../app/constants/messages/quote_messages.ts'
import { QuoteFields } from '../../app/constants/quote_fields.ts'

test.group('Quote Controller & Sub-resources - Validation', (group) => {
  let user: User

  group.each.setup(async () => {
    user = await User.firstOrCreate(
      { email: 'validation_user@example.com' },
      {
        fullName: 'Validation User',
        email: 'validation_user@example.com',
        password: 'password123',
      }
    )
  })

  test('POST /api/v1/quotes - should fail when name is missing', async ({ client, assert }) => {
    const response = await client.post('/api/v1/quotes').loginAs(user).json({})

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.NAME_REQUIRED
    )
  })

  test('POST /api/v1/quotes - should fail when name is less than 2 characters', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'a',
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.NAME_MIN_LENGTH
    )
  })

  test('POST /api/v1/quotes - should fail when name exceeds 120 characters', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'a'.repeat(121),
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.NAME_MAX_LENGTH
    )
  })

  test('POST /api/v1/quotes - should fail when partnerName exceeds 120 characters', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'Valid Name',
        [QuoteFields.PARTNER_NAME]: 'a'.repeat(121),
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.PARTNER_NAME_MAX_LENGTH
    )
  })

  test('POST /api/v1/quotes - should fail when contractLength is non-positive', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'Valid Name',
        [QuoteFields.CONTRACT_LENGTH]: -1,
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.CONTRACT_LENGTH_POSITIVE
    )
  })

  test('POST /api/v1/quotes - should fail when status is invalid enum', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'Valid Name',
        [QuoteFields.STATUS]: 'invalid_status',
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.STATUS_INVALID
    )
  })

  test('GET /api/v1/quotes/:id - should fail when id is non-numeric', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/v1/quotes/abc').loginAs(user)

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.ID_INVALID
    )
  })

  test('DELETE /api/v1/quotes/:id - should fail when id is non-numeric', async ({
    client,
    assert,
  }) => {
    const response = await client.delete('/api/v1/quotes/abc').loginAs(user)

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.ID_INVALID
    )
  })

  test('POST /api/v1/quotes/:id/corridors - should fail when corridors array is missing or empty', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/api/v1/quotes/1/corridors').loginAs(user).json({})

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED
    )
  })

  test('POST /api/v1/quotes/:id/corridors - should fail when corridorId is missing within object', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/quotes/1/corridors')
      .loginAs(user)
      .json({
        corridors: [{ overrideStdFixedFeeUsd: '2.5000' }],
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.CORRIDOR_ID_REQUIRED
    )
  })

  test('PATCH /api/v1/quotes/:id - should fail when version is missing', async ({
    client,
    assert,
  }) => {
    const response = await client
      .patch('/api/v1/quotes/1')
      .loginAs(user)
      .json({
        [QuoteFields.NAME]: 'Updated Name',
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.VERSION_REQUIRED
    )
  })

  test('PATCH /api/v1/quotes/:id - should fail when version is non-positive', async ({
    client,
    assert,
  }) => {
    const response = await client
      .patch('/api/v1/quotes/1')
      .loginAs(user)
      .json({
        [QuoteFields.VERSION]: 0,
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.VERSION_POSITIVE
    )
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should fail when version is missing', async ({
    client,
    assert,
  }) => {
    const response = await client
      .patch('/api/v1/quotes/1/corridors/10001')
      .loginAs(user)
      .json({
        overrideStdFixedFeeUsd: '2.5000',
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.VERSION_REQUIRED
    )
  })

  test('PATCH /api/v1/quotes/:id/corridors/:corridorId - should fail when rates are invalid decimal', async ({
    client,
    assert,
  }) => {
    const response = await client
      .patch('/api/v1/quotes/1/corridors/10001')
      .loginAs(user)
      .json({
        version: 1,
        overrideStdFixedFeeUsd: 'invalid_decimal',
      })

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL
    )
  })

  test('DELETE /api/v1/quotes/:id/corridors - should fail when corridorIds array is empty or missing', async ({
    client,
    assert,
  }) => {
    const response = await client.delete('/api/v1/quotes/1/corridors').loginAs(user).json({})

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED
    )
  })
})
