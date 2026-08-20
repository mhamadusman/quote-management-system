# AI_CONTEXT.md

Persistent context for AI coding agents working on the backend.

## 1. Project

This repository currently contains only the `backend/` AdonisJS API.

It is a quote-management API for a cross-border payments/remittance business.

Core concepts:
- **Quote**: owned by an authenticated user and composed of corridor line items.
- **Corridor**: a priced payment route/reference record.
- **Line item**: a `quote_corridors` row containing fee overrides captured when a corridor is attached.
- **ATV**: average transaction value.
- **TCV**: total contract value.

Current implementation includes:
- Signup, login, logout, profile.
- Quote create/list/show/delete.
- Corridor attach/detach.
- SQL-based quote financial recalculation.

Not implemented:
- Tests.

**Source code is the source of truth.** If this document conflicts with the code, inspect the code and trust it.

## 2. Stack

- Node.js + ESM
- AdonisJS 7
- TypeScript
- Lucid ORM
- PostgreSQL
- VineJS validation
- Session-based cookie authentication
- Japa tests
- REST API under `/api/v1`

Important:
- PostgreSQL `numeric/decimal` values are represented as `string` in TypeScript. Do not silently convert money fields to `number`.
- `database/schema.ts` is generated. Never edit it manually.
- `.adonisjs/` and `build/` are generated. Never edit them manually.

## 3. Architecture

Preserve this layering:

```text
HTTP
  → Middleware
  → Controller
  → Validator
  → Manager
  → Utils
  → Repository
  → Model
  → Response / Global Exception Handler
```

Responsibilities:
- **Controller**: validate input, get authenticated user, call application logic, build response. No general try/catch.
- **Validator**: VineJS request/parameter validation.
- **Manager**: orchestration and transaction boundaries.
- **Utils**: domain assertions/guard clauses; throw the project's `Exception`.
- **Repository**: the only layer that performs Lucid/DB queries.
- **Model**: relationships and model-specific behavior; columns come from generated schema.
- **Exception handler**: centralized error responses and generic 500 handling.

Do not introduce a new service layer or move DB queries into controllers/managers.

## 4. Authentication & Authorization

Authentication uses AdonisJS's `web` session guard and cookies.

- Login creates the session.
- Logout destroys the session.
- Passwords use the existing AuthFinder/scrypt setup.
- Password is never serialized.
- Protected routes use the existing `auth` middleware.
- Authorization is ownership-based: quote queries must be scoped to the authenticated user's `owner_id`.
- A quote owned by another user should normally appear as `404`, not `403`, to avoid leaking its existence.
- There are currently no roles, policies, or abilities.
- CSRF is currently disabled while cookie sessions are used; do not silently change this unless explicitly requested.

## 5. Domain Rules

### Quotes

Quote fields include:
- `name`
- `owner_id`
- `partner_name`
- `contract_length`
- `status`
- `total_revenue`
- `monthly_revenue`
- `tcv`
- `version`

Status values:
`draft | in_review | approved | rejected`

Important:
- `owner_id` is always taken from the authenticated user.
- `version` starts at `1`.
- Do not invent status-transition or approval rules.

### Corridor attachment

Endpoint:

`POST /api/v1/quotes/:id/corridors`

Current payload format:

```json
{
  "corridorIds": "10001,10002"
}
```

Important behavior:
- IDs are parsed from a comma-separated string.
- IDs are trimmed and deduplicated.
- The operation runs in a transaction.
- The quote is locked with `SELECT ... FOR UPDATE` before mutation.
- All corridors must exist.
- None may already be attached.
- The operation is all-or-nothing.
- Fee values are copied from the corridor into the pivot as overrides when attached.
- Quote financials are recalculated afterward.
- Existing payload shape must remain backward compatible unless explicitly changed.
s
### Corridor removal

Endpoint:

`DELETE /api/v1/quotes/:id/corridors`

It uses the same ID format and transaction/locking approach.

All requested corridors must already be attached; otherwise the operation fails.

### Revenue calculation

Business math is implemented in SQL in `QuoteRepository.recalculateQuote`.

For each attached corridor:

```text
revenue_i =
  override_std_fixed_fee_usd * CEIL(100000 / atv_usd)
  + (override_variable_fee_percentage / 100) * 100000
```

Then:

```text
S = SUM(revenue_i)

total_revenue   = S
monthly_revenue = S / 12
tcv             = S * contract_length
version         = version + 1
```

Important:
- `100000` is currently hard-coded.
- The calculation is PostgreSQL-specific.
- Do not change this formula or its interpretation unless explicitly asked.
- FX/cost fields are currently not part of the calculation.
- Corridor fee overrides intentionally snapshot the corridor's values at attach time.

## 6. Database Rules

Main tables:
- `users`
- `quotes`
- `corridors`
- `quote_corridors`
- `audit_logs`
- Adonis auth access-token table/schema exists, but the application currently uses session auth.

Important relationships:
- User → Quotes
- Quote → QuoteCorridors
- Quote ↔ Corridors through `quote_corridors`
- User → AuditLogs

`quote_corridors` has a unique constraint on:

```text
(quote_id, corridor_id)
```

The pivot stores fee overrides.

Important repository rule:
**Repositories are the only layer allowed to access Lucid/DB.**

Known migration issue:
- The repository currently lacks migrations for `users` and `auth_access_tokens`, even though generated schema information exists for them.
- Do not edit generated schema to solve this; add proper migrations if reproducibility is explicitly requested.

## 7. API Conventions

Base prefix:

`/api/v1`

Current routes:

```text
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/account/profile
POST   /api/v1/account/logout

POST   /api/v1/quotes
GET    /api/v1/quotes
GET    /api/v1/quotes/:id
DELETE /api/v1/quotes/:id

POST   /api/v1/quotes/:id/corridors
DELETE /api/v1/quotes/:id/corridors
```

Request JSON uses camelCase.

Normal success response:

```json
{
  "message": "...",
  "data": {}
}
```

Errors:

```json
{
  "message": "...",
  "errors": []
}
```

Validation errors use the existing validation error structure.

Follow existing message constants and `SuccessCodes` / `ErrorCodes`. Do not invent a new response envelope.

## 8. Coding Conventions

Follow the existing code style:

- File names: `snake_case.ts`.
- Classes: `PascalCase`.
- Methods/variables: `camelCase`.
- Database columns: `snake_case`.
- TypeScript/model properties: `camelCase`.
- Repositories, managers and utils are stateless classes with static methods.
- Transactions belong in managers and use `db.transaction(...)`.
- Pass the transaction client down to repositories/utils when required.
- Use `import type` for type-only imports.
- Use existing path aliases where they already exist.
- User-facing messages belong in the existing constants/message system.
- Keep comments focused on **why**, not obvious narration.
- Match the existing Prettier configuration.

## 9. Error Handling

Use the existing custom `Exception` and error codes.

Domain failures should be raised from the appropriate Utils layer and allowed to bubble to the global handler.

Do not:
- Add general try/catch blocks to controllers/managers.
- Return raw database errors.
- Return stack traces or SQL.
- Expose internal error details.
- Change the generic 500 behavior without an explicit reason.

## 10. Current Known Issues

These are known and should not be treated as newly discovered problems:

1. `npm run typecheck` currently has a pre-existing error in `providers/api_provider.ts`.
2. Missing `users` and `auth_access_tokens` migrations.
3. `.env.example` does not list required `DB_URL`.
4. `partnerName` and `contractLength` can be optional in validation but are NOT NULL in the database.
5. Quote creation currently accepts client-supplied financial fields/status that can later be overwritten by recalculation.
6. Corridor IDs are validated as numeric strings although the DB column is string.
7. DELETE quote currently attempts to send a body with HTTP 204.
8. Some unused access-token/cookie scaffolding remains.
9. CSRF is disabled with cookie sessions.
10. `recalculateQuote` uses hard-coded PostgreSQL-specific financial logic.
11. Generated `.adonisjs` files are tracked and may show modifications.

Do not fix these as part of unrelated feature work.

## 11. AI Coding Rules

1. Inspect the actual code before making architectural decisions.
2. Preserve the existing layering:
   `Controller → Validator → Manager → Utils → Repository → Model`.
3. Reuse existing abstractions before creating new ones.
4. Do not add dependencies unless necessary.
5. Never edit `database/schema.ts`, `.adonisjs/`, or `build/` manually.
6. Never add `@column()` declarations to models; columns come from generated schema.
7. Do not rename existing files, classes, routes, fields, or domain concepts without a clear requirement.
8. Do not change business calculations, fee snapshotting, locking, or version behavior unless explicitly requested.
9. Do not invent roles, permissions, approval workflows, audit behavior, or other requirements.
10. Keep changes within the requested scope; avoid unrelated refactoring.
11. Preserve existing routes and payload shapes unless explicitly asked to change them.
12. Multi-write operations must use a transaction in the manager.
13. Lock the quote before mutating its line items.
14. Keep money/decimal values as strings where required by the existing schema.
15. Use the existing exception and response contracts.
16. After changes, run:

```text
npm run typecheck
npm run lint
npm test
```

17. Distinguish pre-existing failures from failures introduced by your changes.
18. If a feature requires new DB columns, create a migration and regenerate the schema.
19. If you fix a documented known issue, update this file accordingly.
20. Prefer small, focused changes over rewrites.

# corridors sample data for test cases
{
    "id": "10000",
    "versionId": 42,
    "sourceRowId": "200000",
    "region": "Europe",
    "country": "Netherlands",
    "transactionType": "B2C",
    "service": "Card",
    "receivingPartner": "Banking Circle S.A. (BankingCircle Luxembourg)",
    "payer": "All Banks Netherlands / NOK / Payment System: Local ACH",
    "payoutCurrency": "NOK",
    "corridor_id": 10000,
    "historicalATV": 1207.956349,
    "atvUSD": 1208,
    "stdFixedFeeUSD": 2.3,
    "variableFeePercentage": 1.24,
    "fxSource": "Market rate",
    "defaultFxSpread": 1.5,
    "treasuryFxCost": 0.08,
    "costFixedPerUSD": 0.030384527728982,
    "costVariablePerTrx": 0.39,
    "needsApproval": false
  },
  {
    "id": "10001",
    "versionId": 47,
    "sourceRowId": "200001",
    "region": "Africa",
    "country": "South Africa",
    "transactionType": "C2C",
    "service": "BankAccount",
    "receivingPartner": "Payment Network Ltd.",
    "payer": "All Banks South Africa / MAD / Payment System: RTGS",
    "payoutCurrency": "MAD",
    "corridor_id": 10001,
    "historicalATV": 1751.517858,
    "atvUSD": 1752,
    "stdFixedFeeUSD": 2.2,
    "variableFeePercentage": 0.92,
    "fxSource": "Reuters Ask rates",
    "defaultFxSpread": 2,
    "treasuryFxCost": 0.14,
    "costFixedPerUSD": 0.097736458887285,
    "costVariablePerTrx": 0.73,
    "needsApproval": false
  },


