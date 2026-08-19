# AI_CONTEXT.md

Persistent project context for AI coding agents. Read this fully before making non-trivial changes.
The **source code is the source of truth**; this file summarizes it. If you find a contradiction, trust the code and update this file.

This file lives at `backend/AI_CONTEXT.md`. The git repository root is one level up (`quote-management-system/`, containing `.git` and `backend/`).
Unless a path is explicitly prefixed with `backend/`, all paths in this document are relative to the `backend/` directory — which is also the working directory for every command shown here.
Only one workspace exists today: `backend/` (AdonisJS API). **There is no frontend in this repository.**

---

## 1. Project Overview

A **quote management API** for a cross-border payments / remittance business.

- A **Corridor** is a priced payment route (region → country, transaction type, service, receiving partner, payout currency) with commercial parameters (average transaction value, fixed fee, variable fee %, FX spread, cost data).
- A **Quote** belongs to a single user (the "owner") and represents a commercial proposal for a partner. Corridors are attached to a quote as line items (pivot table `quote_corridors`), each capturing an **override** of the corridor's fee values at attach time.
- When corridors are attached/removed, the quote's financials (`total_revenue`, `monthly_revenue`, `tcv`) are **recalculated in SQL** and the quote's `version` is incremented.

Users / roles:
- Only one actor type exists in code: an authenticated **user** who owns quotes. **There is no role or permission column anywhere.** Authorization is purely ownership-based (`quotes.owner_id = current user`).

Current status: **early-stage backend only.** Auth (signup/login/logout/profile) and quote create/list/show/delete + attach/remove corridors are implemented. No update endpoint, no corridor listing endpoint, no status-transition logic, no audit-log writes, no tests.

Domain vocabulary: `ATV` = average transaction value, `TCV` = total contract value, `corridor` = priced payment route, `line item` = corridor attached to a quote (commit messages use "line items" for `quote_corridors` rows).

---

## 2. Technology Stack

Everything below was verified in `backend/package.json` and config files.

| Concern | Actual choice |
|---|---|
| Runtime | Node.js, ESM (`"type": "module"`) |
| Framework | AdonisJS v7 (`@adonisjs/core` ^7.4.0) |
| Language | TypeScript ~6.0 (`@adonisjs/tsconfig/tsconfig.app.json`) |
| ORM | Lucid ^22.4 (`@adonisjs/lucid`) |
| Database | PostgreSQL via `pg`, single connection named `postgres`, configured from `DB_URL` |
| Auth | `@adonisjs/auth` ^10 — **session guard (`web`) is the default**; a `api` tokens guard is configured but unused by routes |
| Sessions | `@adonisjs/session` (cookie store by default, `adonis-session` cookie) |
| Validation | VineJS ^4 (`@vinejs/vine`) |
| Hashing | scrypt (`config/hash.ts`) |
| API style | JSON REST under `/api/v1` |
| CORS | `@adonisjs/cors`, `credentials: true`, origin `true` in dev / `[]` in prod |
| Security headers | `@adonisjs/shield` (CSP off, **CSRF off**, HSTS + xFrame on) |
| Typed client | `@tuyau/core` generates `.adonisjs/client/registry` (route registry) |
| Tests | Japa (`@japa/runner`, `@japa/assert`, `@japa/api-client`) — configured, **zero test files written** |
| Lint/format | `@adonisjs/eslint-config`, `@adonisjs/prettier-config` |

`better-sqlite3` is a declared dependency but **no sqlite connection is configured** — treat it as vestigial.

### Scripts (`backend/`)
```
npm run dev            # node ace serve --hmr
npm run build          # node ace build
npm start              # node bin/server.js (after build)
npm test               # node ace test
npm run lint           # eslint .
npm run format         # prettier --write .
npm run typecheck      # tsc --noEmit
npm run migration:dev  # node ace migration:run
node ace db:seed       # runs database/seeders/corridor_seeder.ts
```

---

## 3. Project Architecture

Layered, strictly one-directional. **Preserve this layering.**

```
HTTP request
  → server middleware   (force JSON accept, container bindings, CORS)
  → router middleware   (bodyparser, session, shield, initialize_auth, silent_auth)
  → named middleware    (auth) on protected route groups
  → Controller          (app/controllers)
  → Validator           (app/validators, VineJS)
  → Manager             (app/managers)      ← orchestration + DB transactions
  → Utils               (app/utils)         ← domain assertions / guard clauses, throw Exception
  → Repository          (app/repositories)  ← the ONLY layer that touches Lucid/DB
  → Model               (app/models)        ← relationships only
  → Response            ({ message, data }) or thrown Exception → app/exceptions/handler.ts
```

Layer responsibilities as actually implemented:

- **Controller** (`quote_controller.ts`): validate input, read the authenticated user via `auth.getUserOrFail()`, call the manager (or a repository directly for simple creates), build the HTTP response with a `SuccessCodes` status + a message constant. Controllers contain **no try/catch** — errors bubble to the global handler.
- **Manager** (`quote_manager.ts`): the transaction boundary. Opens `db.transaction(...)`, calls the `*Utils` assertions with the `trx`, then the repository mutations, then recalculation. Read-only operations are thin pass-throughs to Utils (kept for a stable controller-facing API).
- **Utils** (`quote_utils.ts`, `corridor_utils.ts`): "assert" helpers that fetch through repositories and `throw new Exception(message, ErrorCodes.X)` when a domain precondition fails. This is where NOT_FOUND / CONFLICT / BAD_REQUEST decisions live.
- **Repository** (`quote_repository.ts`, `corridor_repository.ts`): all Lucid queries and raw SQL. Static-only classes. Accepts an optional `TransactionClientContract` where transactional.
- **Model** (`app/models/*.ts`): **columns are NOT declared here.** Each model extends a generated `*Schema` base class from `database/schema.ts` and only adds relationships, mixins, and getters.
- **Transformer** (`app/transformers/user_transformer.ts`): whitelist-based output shaping (`this.pick(...)`), used with `ctx.serialize()`.
- **Provider** (`providers/api_provider.ts`): registers `HttpContext.serialize` (an `ApiSerializer` that wraps output in `data`) and pings the DB on boot.

Notable architectural facts:
- **Business math lives in SQL**, not in TypeScript (`QuoteRepository.recalculateQuote`). Commit `478d687` states this explicitly ("made calculations on query level").
- Pessimistic locking is used: `QuoteRepository.lockQuote` does `SELECT ... FOR UPDATE` inside the transaction before mutating corridors.
- Money/decimal columns are typed as **`string`** in the generated schema (Postgres `numeric` returned as string). Do not silently convert them to `number`.

---

## 4. Directory Structure

```
backend/
├── app/
│   ├── constants/
│   │   ├── messages/            # user-facing message catalogues (auth_*, quote_messages)
│   │   ├── cookie_options.ts    # access-token cookie options (UNUSED, see §11)
│   │   ├── error_codes.ts       # ErrorCodes enum (HTTP 4xx/5xx)
│   │   ├── quote_fields.ts      # QuoteFields map of camelCase field names
│   │   └── success_codes.ts     # SuccessCodes enum (200/201/204)
│   ├── controllers/             # access_tokens, new_account, profile, quote
│   ├── exceptions/
│   │   ├── exception.ts         # custom Exception (extends Adonis Exception)
│   │   └── handler.ts           # global HttpExceptionHandler
│   ├── managers/                # quote_manager.ts — transactions/orchestration
│   ├── middleware/              # auth, silent_auth, force_json_response,
│   │                            # container_bindings, cookie_to_auth_header (unused)
│   ├── models/                  # quote, corridor, quote_corridor, user, audit_log
│   ├── repositories/            # quote_repository, corridor_repository
│   ├── transformers/            # user_transformer
│   ├── types/types.ts           # ValidationError type
│   ├── utils/                   # quote_utils, corridor_utils (domain assertions)
│   └── validators/              # auth_validator, quote_validator (VineJS)
├── config/                      # app, auth, bodyparser, cors, database, encryption,
│                                # hash, logger, session, shield
├── database/
│   ├── migrations/              # 6 migrations (see §5 for what is MISSING)
│   ├── seeders/corridor_seeder.ts
│   ├── schema.ts                # GENERATED from the DB — DO NOT EDIT
│   └── schema_rules.ts          # empty SchemaRules object
├── providers/api_provider.ts
├── start/                       # routes.ts, kernel.ts, env.ts, validator.ts
├── tests/bootstrap.ts           # Japa setup; no spec files exist
├── .adonisjs/                   # GENERATED (controllers index, Tuyau route registry)
├── adonisrc.ts, tsconfig.json, eslint.config.js
```

`build/`, `node_modules/`, `tmp/`, `.adonisjs/` are generated. Do not hand-edit them.

---

## 5. Database Schema

Postgres. Column names are `snake_case`; Lucid maps them to `camelCase` properties.

### `quotes` (migration `1787066847656`)
| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `name` | string | NOT NULL |
| `owner_id` | int unsigned FK → `users.id` | NOT NULL, **ON DELETE CASCADE** |
| `partner_name` | string | **NOT NULL, no default** |
| `contract_length` | int | **NOT NULL, no default** (unit not stated in code; used as a multiplier for TCV) |
| `status` | enum(`draft`,`in_review`,`approved`,`rejected`) | NOT NULL, default `draft` |
| `total_revenue` | decimal(15,2) | NOT NULL default 0 |
| `monthly_revenue` | decimal(15,2) | NOT NULL default 0 |
| `tcv` | decimal(15,2) | NOT NULL default 0 |
| `version` | int | NOT NULL, no default (set to 1 by the controller on create) |
| `created_at` / `updated_at` | timestamp | `updated_at` nullable |

### `corridors` (migration `1787066910102`)
- `id` **string PK** (seeder produces numeric-looking strings starting at `"10000"`).
- `version_id` int, `source_row_id` string — reference data lineage from an external source; **no versioning logic is implemented for corridors in code.**
- Descriptive: `region`, `country`, `transaction_type`, `service`, `receiving_partner`, `payer`, `payout_currency`, `fx_source` (all NOT NULL strings).
- Numeric: `historical_atv` (15,2), `atv_usd` (15,2), `std_fixed_fee_usd` (15,4), `variable_fee_percentage` (8,4), `default_fx_spread` (8,4), `treasury_fx_cost` (8,4), `cost_fixed_per_usd` (15,4), `cost_variable_per_trx` (15,4) — all NOT NULL.
- `needs_approval` boolean NOT NULL (seeded true ~10% of the time; **never read by any code path**).
- Timestamps as above.

### `quote_corridors` (pivot; migrations `1787066948129`, `1787070131652`, `1787121272563`)
| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | pivot has its own surrogate key |
| `quote_id` | int FK → `quotes.id` | NOT NULL, ON DELETE CASCADE |
| `corridor_id` | string FK → `corridors.id` | NOT NULL, ON DELETE CASCADE |
| `override_std_fixed_fee_usd` | decimal(15,4) nullable | copied from the corridor at attach time |
| `override_variable_fee_percentage` | decimal(8,4) nullable | copied from the corridor at attach time |
| `created_at` / `updated_at` | timestamp | pivot timestamps enabled in the model |

- A `revenue` column existed in the first migration and was **dropped** in `1787070131652` (revenue is aggregated on the quote instead).
- **Unique constraint** `quote_corridors_quote_id_corridor_id_unique` on `(quote_id, corridor_id)` — a corridor can be attached to a quote at most once.
- No explicit extra indexes beyond PK/FK/unique.

### `audit_logs` (migration `1787066981771`)
`id` serial PK, `user_id` FK → `users.id` (CASCADE), `action` string, `entity_type` string, `entity_id` int, `changes` json nullable, `ip_address` nullable, `user_agent` nullable, `created_at`. **Table + model exist; nothing writes to it.**

### Relationships (as declared in models)
- `User hasMany Quote` (fk `ownerId`), `User hasMany AuditLog` (fk `userId`)
- `Quote belongsTo User` (`owner`), `Quote hasMany QuoteCorridor`, `Quote manyToMany Corridor` via `quote_corridors` with pivot columns `override_std_fixed_fee_usd`, `override_variable_fee_percentage` and `pivotTimestamps: true`
- `Corridor manyToMany Quote` (mirror), `Corridor hasMany QuoteCorridor`
- `QuoteCorridor belongsTo Quote` / `belongsTo Corridor`

### IMPORTANT: missing migrations
`database/schema.ts` (generated from the live database) contains `UserSchema` (`id`, `full_name` nullable, `email`, `password` serialized as null, timestamps) and `AuthAccessTokenSchema` (standard Adonis access-token columns), **but there are no `create_users_table` or `create_auth_access_tokens_table` migrations in the repository** (verified via `git ls-files backend/database`). A fresh clone cannot build the DB from migrations alone. Do not "fix" this by editing `database/schema.ts` (it is generated). If you need reproducible setup, add the missing migrations — and say so explicitly.

`database/schema.ts` is regenerated by `node ace migration:run`. Never hand-edit it; change a migration instead.

---

## 6. Domain / Business Rules

Marked **[IMPLEMENTED]** (present in code) or **[ASSUMED]** (inferred from implementation, not stated anywhere).

### Quote creation — `POST /api/v1/quotes`
- **[IMPLEMENTED]** Validated by `quoteSchemaValidator`; `owner_id` is forced to the authenticated user and `version` is forced to `1`. Clients cannot set the owner.
- **[IMPLEMENTED]** Client *may* pass `monthlyRevenue`, `tcv`, `totalRevenue`, and `status` on create; they are persisted as given.
- **[ASSUMED / RISK]** `partnerName` and `contractLength` are **optional in the validator but NOT NULL without defaults in the DB** — omitting them causes a Postgres not-null violation surfaced as a generic 500. Treat this as a known bug (§11), not as intended behaviour.

### Quote reads
- **[IMPLEMENTED]** `index` returns all quotes of the current user with `corridors` preloaded (including pivot columns). `show` returns one quote scoped by `id` + `owner_id`, corridors preloaded; missing/foreign → `404 Quote not found`.
- **[IMPLEMENTED]** No pagination, no filtering, no sorting.

### Quote deletion
- **[IMPLEMENTED]** Ownership-scoped lookup, then `quote.delete()`. Pivot rows are removed by the FK `ON DELETE CASCADE`. Responds `204`.

### Attaching corridors — `POST /api/v1/quotes/:id/corridors`
Body: `{ "corridorIds": "10001,10002" }` (a **comma-separated string**, not an array).
- **[IMPLEMENTED]** IDs are split on `,`, trimmed, falsy values dropped, and de-duplicated via `new Set`.
- **[IMPLEMENTED]** Inside one transaction: lock the quote (`FOR UPDATE`, ownership-scoped → 404), assert every corridor exists (→ 404 `One or more corridors do not exist`), assert **none** of them is already attached (→ 409 `One or more corridors are already attached to the quote`), attach, then recalculate.
- **[IMPLEMENTED]** On attach, the pivot's `override_std_fixed_fee_usd` / `override_variable_fee_percentage` are **seeded from the corridor's current values**, snapshotting the price at attach time.
- **[ASSUMED]** The attach operation is all-or-nothing: one already-attached or unknown corridor rejects the whole request.
- **[NOT IMPLEMENTED]** There is no endpoint to *change* an override after attaching.

### Removing corridors — `DELETE /api/v1/quotes/:id/corridors`
- **[IMPLEMENTED]** Same parsing. In one transaction: lock quote (404), assert **all** given corridors are attached (→ 400 `One or more corridors are not attached to the quote`), detach, recalculate.

### Revenue recalculation — `QuoteRepository.recalculateQuote` (raw SQL, Postgres)
For every attached corridor, per-corridor revenue is:

```
revenue_i = override_std_fixed_fee_usd * CEIL(100000.0 / corridors.atv_usd)
          + (override_variable_fee_percentage / 100.0) * 100000
```

Then, with `S = SUM(revenue_i)` (0 when no corridors are attached):

```
total_revenue   = S
monthly_revenue = S / 12
tcv             = S * contract_length
version         = version + 1
updated_at      = NOW()
```

- **[IMPLEMENTED]** `100000` is a **hard-coded assumed monthly/period USD volume per corridor**. It is not configurable and not stored anywhere.
- **[IMPLEMENTED]** `CEIL(100000 / atv_usd)` is the implied transaction count (rounded up).
- **[ASSUMED]** The interpretation of `S` is inconsistent: it is stored as `total_revenue`, divided by 12 for `monthly_revenue` (implying `S` is annual) yet multiplied by the raw `100000` volume as if it were a single period. Do **not** silently "correct" this — it changes stored financials. Flag it and ask.
- **[IMPLEMENTED]** FX/cost columns (`default_fx_spread`, `treasury_fx_cost`, `cost_fixed_per_usd`, `cost_variable_per_trx`) are **not used** in any calculation. There is no margin/cost model yet.

### Versioning
- **[IMPLEMENTED]** `quotes.version` starts at 1 and is incremented by `recalculateQuote`, i.e. on every corridor attach/remove.
- **[ASSUMED]** "Versioning" is a mutation counter only. **There is no version history table and no snapshotting of previous quote states.** The only historical artefact is the fee override snapshot on the pivot row.

### Status
- **[IMPLEMENTED]** Enum `draft | in_review | approved | rejected`, default `draft`, settable on create.
- **[NOT IMPLEMENTED]** No status transition rules, no approval workflow, no guard preventing edits to `approved` quotes. `corridors.needs_approval` is seeded but never consulted.

### Ownership & permissions
- **[IMPLEMENTED]** Every quote query is scoped by `owner_id = auth user id`. A quote belonging to someone else is indistinguishable from a non-existent one (both `404`) — good practice; keep it.
- **[NOT IMPLEMENTED]** No roles, no admin, no sharing, no Adonis bouncer/policies (`app/policies` and `app/abilities` are only path aliases; the directories do not exist).

### Corridor reference data
- **[IMPLEMENTED]** `corridor_seeder.ts` deterministically generates 3000 corridors using a seeded xorshift PRNG (seed `20260811`), IDs `"10000".."12999"`, `source_row_id` `"200000"+i`.
- **[NOT IMPLEMENTED]** There is **no API endpoint to list or search corridors**. A client cannot discover corridor IDs through the API today.

---

## 7. API Conventions

Base prefix: `/api/v1` (see `start/routes.ts`). Routes reference controllers through the generated `#generated/controllers` map, never string paths.

| Method | Path | Auth | Controller action |
|---|---|---|---|
| GET | `/` | no | inline handler returning `{ hello: 'world' }` |
| POST | `/api/v1/auth/signup` | no | `NewAccount.store` |
| POST | `/api/v1/auth/login` | no | `AccessTokens.store` |
| GET | `/api/v1/account/profile` | yes | `Profile.show` |
| POST | `/api/v1/account/logout` | yes | `AccessTokens.destroy` |
| POST | `/api/v1/quotes` | yes | `Quote.store` |
| GET | `/api/v1/quotes` | yes | `Quote.index` |
| GET | `/api/v1/quotes/:id` | yes | `Quote.show` |
| DELETE | `/api/v1/quotes/:id` | yes | `Quote.destroy` |
| POST | `/api/v1/quotes/:id/corridors` | yes | `Quote.attachCorridors` |
| DELETE | `/api/v1/quotes/:id/corridors` | yes | `Quote.removeCorridors` |

Conventions actually followed:
- Route groups use `.prefix()`, `.as()` and `.use(middleware.auth())`; protected groups are `account` and `quotes`.
- Nested resources are expressed as sub-paths (`/quotes/:id/corridors`); bulk attach/detach uses POST/DELETE on the collection with IDs in the body.
- Request bodies use **camelCase** JSON. Route params are validated too (`quoteIdValidator`).
- Relationship loading is done with explicit `.preload('corridors')` in the repository — never lazy-loaded in controllers.
- **No pagination anywhere** (the `ApiSerializer` supports pagination metadata, but no endpoint paginates).

### Success response shape
Most endpoints hand-build the envelope:
```json
{ "message": "Quote created successfully", "data": { "quote": { } } }
```
- `message` comes from a constant in `app/constants/messages/*`.
- Status codes come from the `SuccessCodes` enum: `201` create, `200` reads/updates/attach/detach, `204` delete.
- **Inconsistency to be aware of:** `ProfileController.show` instead returns `ctx.serialize(UserTransformer.transform(user))`, producing `{ "data": { } }` with **no `message`**. Follow the surrounding file's style; do not mass-migrate one style to the other without being asked.

### Error response shape (from `app/exceptions/handler.ts`)
```json
{ "message": "Quote not found", "errors": [] }
```
Validation failures:
```json
{ "message": "Validation Failed", "errors": [ { "field": "name", "message": "...", "rule": "..." } ] }
```

---

## 8. Error Handling

- **`Exception`** (`app/exceptions/exception.ts`) extends the Adonis exception with code `E_EXCEPTION`. Constructor takes `message: string | ValidationError[]` and a `statusCode: ErrorCodes`. When given an array, `message` becomes `'Validation Failed'` and the array is exposed as `errors`.
- **`HttpExceptionHandler`** (`app/exceptions/handler.ts`, registered in `start/kernel.ts`) maps:
  - `Exception` → its own `status`, `{ message, errors }`
  - `vineErrors.E_VALIDATION_ERROR` → `422` `{ message: 'Validation Failed', errors: error.messages }`
  - `authErrors.E_UNAUTHORIZED_ACCESS` → `401`
  - `authErrors.E_INVALID_CREDENTIALS` → `401`
  - anything else → `500 { message: 'Internal server error' }` with **no internal detail leaked**
- `report()` is the single logging point (`console.error` with method + URL, then `super.report`).
- **Controllers and managers do not try/catch.** Throw a domain `Exception` from a `*Utils` assertion and let it bubble. The only `catch` in the app is in `AccessTokensController.store`, where it converts a credential failure into a generic `Invalid email or password` (avoids user enumeration).
- Never return raw DB errors, stack traces, SQL, or `error.message` of unknown errors to clients.

`ErrorCodes`: 400, 401, 403, 404, 409, 422, 500. `SuccessCodes`: 200, 201, 204.

---

## 9. Authentication & Authorization

- **Session-based cookie auth is what the app uses.** `config/auth.ts` sets `default: 'web'` with `sessionGuard` (+ `useRememberMeTokens: false`); an `api` tokens guard (`DbAccessTokensProvider` on `User`) is configured but no route uses it.
- Login: `POST /api/v1/auth/login` → `User.verifyCredentials(email, password)` → `auth.use('web').login(user)`, which sets the `adonis-session` cookie (httpOnly, `secure` in production, `sameSite: 'lax'`, 2h age).
- Logout: `POST /api/v1/account/logout` → `auth.use('web').logout()`.
- Signup: `POST /api/v1/auth/signup` → `User.create(...)`. Password hashing is automatic (`withAuthFinder(hash)` mixin + scrypt). **`password` is never serialized** (`serializeAs: null` in the generated schema). Signup does **not** log the user in.
- Password policy (`auth_validator.ts`): min 8 chars, at least one lowercase, one uppercase, one special char, plus `password_confirmation` must match. Email must be trimmed, valid, and unique against `users.email`.
- `silent_auth_middleware` runs globally (`auth.check()`, never throws); the named `auth` middleware (`authenticateUsing`) protects the `account` and `quotes` groups.
- Authorization = ownership scoping in the repository/query layer. There are **no roles, policies, or abilities**.
- CSRF is **disabled** in `config/shield.ts` while cookie-based sessions are in use — a real gap for a browser client; call it out rather than silently changing it.

Env vars are read only through `start/env.ts` (`NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_URL`). Never hardcode or print secrets. `.env` is gitignored. Note `.env.example` does **not** list `DB_URL`, although `start/env.ts` requires it — the app will not boot without it.

---

## 10. Coding Conventions

Derived from the existing code. **Match these exactly.**

**Files & directories**
- `snake_case.ts` file names throughout (`quote_controller.ts`, `auth_error_messages.ts`).
- Suffix matches the layer: `*_controller.ts`, `*_repository.ts`, `*_manager.ts`, `*_utils.ts`, `*_validator.ts`, `*_middleware.ts`, `*_transformer.ts`.
- One default-exported class per file (constants/validators files export named consts instead).

**Naming**
- Classes `PascalCase` (`QuoteRepository`); methods/variables `camelCase`; enums/const maps `PascalCase` with `SCREAMING_SNAKE_CASE` members (`ErrorCodes.NOT_FOUND`, `QuoteMessages.ERROR.NOT_FOUND`).
- DB columns `snake_case`; model/TS properties `camelCase`.
- Controller actions use REST names: `store`, `index`, `show`, `destroy`; domain-specific actions are camelCase verbs (`attachCorridors`).

**Imports**
- Prefer subpath aliases from `package.json#imports` for cross-layer imports: `#models/*`, `#validators/*`, `#exceptions/*`, `#controllers/*`, `#middleware/*`, `#transformers/*`, `#database/*`, `#start/*`, `#config/*`, `#generated/*`.
- Existing code is **inconsistent** for `app/constants`, `app/repositories`, `app/managers`, `app/utils`, `app/types` (no alias defined): these are imported with relative paths and an explicit extension, sometimes `.ts` and sometimes `.js` (both resolve under this setup). Follow the file you are editing; if you add an alias, add it to `package.json#imports` and use it consistently.
- Use `import type { ... }` for type-only imports (widely done).

**Classes & methods**
- Repositories, managers, utils are **stateless classes with only `static` methods**. No DI, no instantiation, no interfaces.
- All async methods are `async` + `await`, with explicit `Promise<T>` return types on repository/manager/util methods. Controllers rely on inference.
- Transactions: `await db.transaction(async (trx) => { ... })` in the **manager**; `trx` is threaded down to repositories/utils as a `TransactionClientContract`.

**Models**
- Never add `@column()` declarations to `app/models/*` — columns come from the generated `database/schema.ts`. Models declare relationships with `declare x: BelongsTo<typeof Y>` etc., plus optional getters (see `User.initials`).

**Validation**
- One `vine.compile(vine.object({...}))` per operation, exported as `xxxValidator`, immediately followed by `xxxValidator.messagesProvider = new SimpleMessagesProvider({...})` with `field.rule` keys.
- Field names come from the `QuoteFields` const map (computed keys) so field names and messages stay in sync. Messages live in `app/constants/messages/*` — **no inline user-facing strings in controllers, managers, utils, or validators.**
- Body validation uses `request.validateUsing(validator)`; params/mixed input uses `validator.validate({...})`.
- Custom rules use `vine.createRule` (see `passwordRule`).

**Comments & formatting**
- Prettier (`@adonisjs/prettier-config`): 2 spaces, single quotes, **no semicolons**, LF endings, final newline.
- Comments are sparse and explain *why* (e.g. the notes in `handler.ts`, `api_provider.ts`). Do not add narration comments to obvious code, and do not delete existing ones.

---

## 11. Current Development State

**Implemented (verified in code)**
- Project scaffolding, Postgres connection + boot-time DB ping, generated schema/model split, Tuyau route registry.
- Signup, login (session), logout, profile (transformer + serializer).
- Quotes: create, list (own, corridors preloaded), show (own), delete.
- Corridors: bulk attach / bulk detach with row locking, existence + attachment assertions, fee-override snapshot, SQL revenue recalculation, version bump.
- Centralized error handling, message/code constants, corridor seeder (3000 deterministic rows).

**Not implemented / unfinished**
- **No tests at all** (only `tests/bootstrap.ts`; `tests/unit` and `tests/functional` directories do not exist).
- No quote **update** endpoint — so `name`, `partnerName`, `contractLength`, `status` cannot be changed after creation, even though `tcv` depends on `contract_length`.
- No corridor list/search endpoint; clients have no way to discover corridor IDs.
- No status-transition/approval workflow; `corridors.needs_approval` is never read.
- `audit_logs` table + `AuditLog` model exist but **nothing writes audit entries**.
- No pagination/filtering/sorting on `GET /quotes`.
- No per-line-item override editing endpoint.
- No README or setup documentation anywhere in the repo.

**Known issues / rough edges (do not "discover" these as new; fix only if asked)**
1. `npm run typecheck` currently fails with **one** error: `providers/api_provider.ts(85,48): error TS18046: 'error' is of type 'unknown'`.
2. **Missing `users` and `auth_access_tokens` migrations** (§5) — migrations alone cannot recreate the database.
3. `.env.example` omits the required `DB_URL`.
4. `partnerName` / `contractLength` optional in the validator but NOT NULL in `quotes` → 500 instead of 422 when omitted.
5. `Quote.store` trusts client-supplied `monthlyRevenue`, `tcv`, `totalRevenue` and `status`, which the recalculation later overwrites — inconsistent source of truth.
6. `attachCorridorsValidator` / `removeCorridorsValidator` require a **comma-separated numeric string**, while `corridors.id` is a `string` column. Non-numeric corridor IDs cannot be attached even though the schema allows them.
7. `destroy` sends a body with `204` (HTTP has no body for 204; the message is effectively dropped).
8. `index` and `show` reuse the same success message (`QuoteMessages.SUCCESS.SHOW`).
9. Dead code: `app/middleware/cookie_to_auth_header_middleware.ts` and `app/constants/cookie_options.ts` are **not registered/used anywhere** (leftovers from the access-token approach abandoned in favour of sessions). `QuoteRepository.getAll` and `getById` are also unused. `better-sqlite3` is unused.
10. CSRF is disabled while using cookie sessions (`config/shield.ts`).
11. `recalculateQuote` uses Postgres-specific SQL (`CEIL`, `NOW()`) and a hard-coded `100000` volume — it is not portable and not configurable.
12. `.adonisjs/` generated files are tracked in git and currently show uncommitted modifications.

---

## 12. Important Architectural Decisions (as evidenced by the code/history)

- **Business logic out of controllers.** Controllers only validate + shape responses; orchestration sits in managers, guards in utils, persistence in repositories. Commit `c1eb7fb` ("cleaned the code structure") established this.
- **Calculations in SQL, not TypeScript** (commit `478d687`). One `UPDATE ... SET ... (SELECT SUM ...)` statement recomputes all three financial fields atomically inside the same transaction as the attach/detach, so a quote's totals can never be out of sync with its line items and no read-modify-write race exists.
- **Pessimistic locking (`SELECT ... FOR UPDATE`) + a unique `(quote_id, corridor_id)` index** as belt-and-braces protection against concurrent attach requests duplicating line items.
- **Fee snapshotting on the pivot** (`override_*` columns default to the corridor's current values): corridor reference data can change later without retroactively altering existing quotes; the override columns are also the hook for future per-quote custom pricing.
- **The `revenue` column was moved off the pivot** (migration `1787070131652`) in favour of aggregates on `quotes` — a single place to read a quote's financials.
- **Columns generated into `database/schema.ts`, relationships in models**: migrations are the single source of truth for columns, eliminating drift between migrations and model definitions. This is why models must never redeclare columns.
- **Session guard chosen over access tokens** (commit `5e0b916`, `config/auth.ts` comment "Default guard changed to 'web' for session-based cookie auth"), leaving the token guard and cookie helpers behind as unused scaffolding.
- **Message/status-code constants** centralize user-facing copy and HTTP semantics so responses stay uniform and translatable.
- **Global exception handler with a generic 500 fallback** so no controller needs defensive try/catch and no internal error detail can leak (see the comments in `handler.ts`).
- **Ownership-scoped queries returning 404 (not 403)** for another user's quote, to avoid leaking existence.
- **`force_json_response_middleware`** forces `Accept: application/json` so this API never renders HTML error pages — it is API-only.

---

## Rules for AI Coding Agents

1. Read this file before making significant changes; inspect the actual code before proposing new architecture.
2. **Preserve the existing layering** (Controller → Validator → Manager → Utils → Repository → Model). Do not introduce a "services" directory or move DB queries into controllers/managers.
3. Reuse existing abstractions: `Exception` + `ErrorCodes`, `SuccessCodes`, message constants, `QuoteFields`, existing repositories/utils/validators. Check for an existing helper before creating a new one.
4. Do not add dependencies unless necessary. The stack is fixed (AdonisJS + Lucid + VineJS + Postgres).
5. **Never add `@column()` declarations to `app/models/*`** and never hand-edit `database/schema.ts` or anything in `.adonisjs/` or `build/` — they are generated. Change migrations and re-run `node ace migration:run`.
6. Do not rename files, classes, variables, DB columns, routes, or domain concepts without a stated reason.
7. Do not change business logic — especially the revenue formula, the hard-coded `100000` volume, the `version` increment behaviour, or the fee-override snapshot — unless explicitly asked. These affect stored financial data.
8. Do not invent requirements (roles, approval workflows, audit logging, corridor pricing models). If a requirement is ambiguous, inspect the code first and state your assumptions explicitly.
9. Keep changes within the requested scope; avoid unrelated refactoring and drive-by cleanups of the known issues in §11.
10. Never expose secrets, `.env` values, SQL, or stack traces in code, responses, or logs. Keep the generic `500` fallback intact.
11. Follow the existing error-handling contract: throw `new Exception(MessageConstant, ErrorCodes.X)` from a `*Utils` assertion; do not add try/catch in controllers/managers.
12. Follow the existing response contract: `{ message, data }` with a `SuccessCodes` status, using message constants. Do not invent a new envelope.
13. Put every multi-write operation inside `db.transaction()` in the **manager**, thread `trx` down, and lock the quote before mutating its line items.
14. Money/decimal fields are `string` in TypeScript. Do not convert them to `number` for storage or comparison.
15. Maintain backward compatibility of existing routes and payload shapes (including the comma-separated `corridorIds` string) unless asked to change them.
16. Prefer small, focused changes over rewrites. Working code stays.
17. After changes, run `npm run typecheck`, `npm run lint`, and `npm test` in `backend/`. Note that `typecheck` already fails on the pre-existing `api_provider.ts` error (§11.1) — make sure you introduce no *new* failures.
18. When you add a feature that needs new DB columns, write a migration (`node ace make:migration`), run it, and let `database/schema.ts` regenerate.
19. If you fix or discover something documented here as an issue/assumption, update this file in the same change.
