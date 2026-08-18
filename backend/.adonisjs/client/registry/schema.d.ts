/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'quotes.quote.store': {
    methods: ["POST"]
    pattern: '/api/v1/quotes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote_validator').quoteSchemaValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quote_validator').quoteSchemaValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'quotes.quote.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/quotes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/quote_validator').quoteIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'quotes.quote.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/quotes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote_validator').quoteIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote_validator').quoteIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'quotes.quote.attach_corridors': {
    methods: ["POST"]
    pattern: '/api/v1/quotes/:id/corridors'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote_validator').attachCorridorsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote_validator').attachCorridorsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['attachCorridors']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quote_controller').default['attachCorridors']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
