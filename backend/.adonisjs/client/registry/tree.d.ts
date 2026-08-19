/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  corridors: {
    corridor: {
      index: typeof routes['corridors.corridor.index']
    }
  }
  quotes: {
    quote: {
      store: typeof routes['quotes.quote.store']
      index: typeof routes['quotes.quote.index']
      show: typeof routes['quotes.quote.show']
      update: typeof routes['quotes.quote.update']
      destroy: typeof routes['quotes.quote.destroy']
      listCorridors: typeof routes['quotes.quote.list_corridors']
      attachCorridors: typeof routes['quotes.quote.attach_corridors']
      updateCorridor: typeof routes['quotes.quote.update_corridor']
      removeCorridors: typeof routes['quotes.quote.remove_corridors']
    }
  }
}
