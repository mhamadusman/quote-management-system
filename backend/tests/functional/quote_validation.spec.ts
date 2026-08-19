import { test } from '@japa/runner'
import User from '#models/user'
import { ErrorCodes } from '../../app/constants/error_codes.ts'
import { QuoteMessages } from '../../app/constants/messages/quote_messages.ts'
import { QuoteFields } from '../../app/constants/quote_fields.ts'

test.group('Quote Controller - Validation', (group) => {
  let user: User

  group.each.setup(async () => {
    user = await User.firstOrFail()
  })

  test('POST /api/v1/quotes - should fail when name is missing', async ({ client, assert }) => {
    const response = await client.post('/api/v1/quotes').loginAs(user).json({})

    response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
    assert.include(
      response.body().errors.map((err: { message: string }) => err.message),
      QuoteMessages.ERROR.NAME_REQUIRED
    )
  })

  test(
    'POST /api/v1/quotes - should fail when name is less than 2 characters',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'POST /api/v1/quotes - should fail when name exceeds 120 characters',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'POST /api/v1/quotes - should fail when partnerName exceeds 120 characters',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'POST /api/v1/quotes - should fail when contractLength is non-positive',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'POST /api/v1/quotes - should fail when monthlyRevenue is invalid decimal',
    async ({ client, assert }) => {
      const response = await client
        .post('/api/v1/quotes')
        .loginAs(user)
        .json({
          [QuoteFields.NAME]: 'Valid Name',
          [QuoteFields.MONTHLY_REVENUE]: 'invalid-decimal',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.MONTHLY_REVENUE_DECIMAL
      )
    }
  )

  test(
    'POST /api/v1/quotes - should fail when tcv is invalid decimal',
    async ({ client, assert }) => {
      const response = await client
        .post('/api/v1/quotes')
        .loginAs(user)
        .json({
          [QuoteFields.NAME]: 'Valid Name',
          [QuoteFields.TCV]: 'invalid-decimal',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.TCV_DECIMAL
      )
    }
  )

  test(
    'POST /api/v1/quotes - should fail when totalRevenue is invalid decimal',
    async ({ client, assert }) => {
      const response = await client
        .post('/api/v1/quotes')
        .loginAs(user)
        .json({
          [QuoteFields.NAME]: 'Valid Name',
          [QuoteFields.TOTAL_REVENUE]: 'invalid-decimal',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.TOTAL_REVENUE_DECIMAL
      )
    }
  )

  test(
    'POST /api/v1/quotes - should fail when status is invalid enum',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'GET /api/v1/quotes/:id - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client.get('/api/v1/quotes/abc').loginAs(user)

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'DELETE /api/v1/quotes/:id - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client.delete('/api/v1/quotes/abc').loginAs(user)

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'POST /api/v1/quotes/:id/corridors - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client
        .post('/api/v1/quotes/abc/corridors')
        .loginAs(user)
        .json({
          [QuoteFields.CORRIDOR_IDS]: '10000',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'POST /api/v1/quotes/:id/corridors - should fail when corridorIds is missing',
    async ({ client, assert }) => {
      const response = await client.post('/api/v1/quotes/1/corridors').loginAs(user).json({})

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED
      )
    }
  )

  test(
    'POST /api/v1/quotes/:id/corridors - should fail when corridorIds format is invalid',
    async ({ client, assert }) => {
      const response = await client
        .post('/api/v1/quotes/1/corridors')
        .loginAs(user)
        .json({
          [QuoteFields.CORRIDOR_IDS]: 'abc,def',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.CORRIDOR_IDS_INVALID
      )
    }
  )

  test(
    'DELETE /api/v1/quotes/:id/corridors - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client
        .delete('/api/v1/quotes/abc/corridors')
        .loginAs(user)
        .json({
          [QuoteFields.CORRIDOR_IDS]: '10000',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'DELETE /api/v1/quotes/:id/corridors - should fail when corridorIds is missing',
    async ({ client, assert }) => {
      const response = await client.delete('/api/v1/quotes/1/corridors').loginAs(user).json({})

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.CORRIDOR_IDS_REQUIRED
      )
    }
  )

  test(
    'DELETE /api/v1/quotes/:id/corridors - should fail when corridorIds format is invalid',
    async ({ client, assert }) => {
      const response = await client
        .delete('/api/v1/quotes/1/corridors')
        .loginAs(user)
        .json({
          [QuoteFields.CORRIDOR_IDS]: 'invalid-format',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.CORRIDOR_IDS_INVALID
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/abc')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when version is missing',
    async ({ client, assert }) => {
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
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when version is non-positive',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: -1,
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.VERSION_POSITIVE
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when name is less than 2 characters',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
          [QuoteFields.NAME]: 'a',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.NAME_MIN_LENGTH
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when contractLength is non-positive',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
          [QuoteFields.CONTRACT_LENGTH]: 0,
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.CONTRACT_LENGTH_POSITIVE
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id - should fail when status is invalid enum',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
          [QuoteFields.STATUS]: 'unknown_status',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.STATUS_INVALID
      )
    }
  )

  test(
    'GET /api/v1/quotes/:id/corridors - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client.get('/api/v1/quotes/abc/corridors').loginAs(user)

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id/corridors/:corridorId - should fail when id is non-numeric',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/abc/corridors/10000')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.ID_INVALID
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id/corridors/:corridorId - should fail when version is missing',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1/corridors/10000')
        .loginAs(user)
        .json({
          [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: '2.5',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      assert.include(
        response.body().errors.map((err: { message: string }) => err.message),
        QuoteMessages.ERROR.VERSION_REQUIRED
      )
    }
  )

  test(
    'PATCH /api/v1/quotes/:id/corridors/:corridorId - should fail when override rates are invalid decimal',
    async ({ client, assert }) => {
      const response = await client
        .patch('/api/v1/quotes/1/corridors/10000')
        .loginAs(user)
        .json({
          [QuoteFields.VERSION]: 1,
          [QuoteFields.OVERRIDE_STD_FIXED_FEE_USD]: 'invalid',
          [QuoteFields.OVERRIDE_VARIABLE_FEE_PERCENTAGE]: 'invalid',
        })

      response.assertStatus(ErrorCodes.UNPROCESSABLE_ENTITY)
      const errorMessages = response.body().errors.map((err: { message: string }) => err.message)
      assert.include(errorMessages, QuoteMessages.ERROR.OVERRIDE_STD_FIXED_FEE_USD_DECIMAL)
      assert.include(
        errorMessages,
        QuoteMessages.ERROR.OVERRIDE_VARIABLE_FEE_PERCENTAGE_DECIMAL
      )
    }
  )
})
