/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'corridors.corridor.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/corridors',
    tokens: [{"old":"/api/v1/corridors","type":0,"val":"api","end":""},{"old":"/api/v1/corridors","type":0,"val":"v1","end":""},{"old":"/api/v1/corridors","type":0,"val":"corridors","end":""}],
    types: placeholder as Registry['corridors.corridor.index']['types'],
  },
  'quotes.quote.store': {
    methods: ["POST"],
    pattern: '/api/v1/quotes',
    tokens: [{"old":"/api/v1/quotes","type":0,"val":"api","end":""},{"old":"/api/v1/quotes","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes","type":0,"val":"quotes","end":""}],
    types: placeholder as Registry['quotes.quote.store']['types'],
  },
  'quotes.quote.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/quotes',
    tokens: [{"old":"/api/v1/quotes","type":0,"val":"api","end":""},{"old":"/api/v1/quotes","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes","type":0,"val":"quotes","end":""}],
    types: placeholder as Registry['quotes.quote.index']['types'],
  },
  'quotes.quote.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/quotes/:id',
    tokens: [{"old":"/api/v1/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quotes.quote.show']['types'],
  },
  'quotes.quote.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/quotes/:id',
    tokens: [{"old":"/api/v1/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quotes.quote.update']['types'],
  },
  'quotes.quote.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/quotes/:id',
    tokens: [{"old":"/api/v1/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quotes.quote.destroy']['types'],
  },
  'quotes.quote.list_corridors': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/quotes/:id/corridors',
    tokens: [{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id/corridors","type":1,"val":"id","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"corridors","end":""}],
    types: placeholder as Registry['quotes.quote.list_corridors']['types'],
  },
  'quotes.quote.attach_corridors': {
    methods: ["POST"],
    pattern: '/api/v1/quotes/:id/corridors',
    tokens: [{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id/corridors","type":1,"val":"id","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"corridors","end":""}],
    types: placeholder as Registry['quotes.quote.attach_corridors']['types'],
  },
  'quotes.quote.update_corridor': {
    methods: ["PATCH"],
    pattern: '/api/v1/quotes/:id/corridors/:corridorId',
    tokens: [{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":1,"val":"id","end":""},{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":0,"val":"corridors","end":""},{"old":"/api/v1/quotes/:id/corridors/:corridorId","type":1,"val":"corridorId","end":""}],
    types: placeholder as Registry['quotes.quote.update_corridor']['types'],
  },
  'quotes.quote.remove_corridors': {
    methods: ["DELETE"],
    pattern: '/api/v1/quotes/:id/corridors',
    tokens: [{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"api","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"v1","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"quotes","end":""},{"old":"/api/v1/quotes/:id/corridors","type":1,"val":"id","end":""},{"old":"/api/v1/quotes/:id/corridors","type":0,"val":"corridors","end":""}],
    types: placeholder as Registry['quotes.quote.remove_corridors']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
