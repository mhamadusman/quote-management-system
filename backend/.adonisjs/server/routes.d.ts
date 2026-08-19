import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'corridors.corridor.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.store': { paramsTuple?: []; params?: {} }
    'quotes.quote.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.list_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.attach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.update_corridor': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'corridorId': ParamValue} }
    'quotes.quote.remove_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'corridors.corridor.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.list_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'corridors.corridor.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.index': { paramsTuple?: []; params?: {} }
    'quotes.quote.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.list_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'quotes.quote.store': { paramsTuple?: []; params?: {} }
    'quotes.quote.attach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'quotes.quote.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.update_corridor': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'corridorId': ParamValue} }
  }
  DELETE: {
    'quotes.quote.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.quote.remove_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}