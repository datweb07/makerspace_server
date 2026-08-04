# Maintenance and Handover Guide

## 1. Recommended reading order

1. `src/index.ts`, configuration, and constants for bootstrap and prefixes.
2. `models/db/pool.ts` and `type.d.ts` for language/database routing.
3. The relevant route, controller, schema, and model together.
4. JWT, email, upload middleware, and image transforms for security/side effects.
5. Package/build configuration and the GitHub deployment workflow.
6. This documentation set, using API inventory/reference as the contract baseline.

## 2. Core-file change map

| Change | Minimum code surface |
|---|---|
| Prefix/CORS/static/plugins | bootstrap, config, constants |
| Language/database | global hook, pool, special header/query readers |
| Authentication | user route/controller, JWT utility, account model, auth placeholders |
| CMS CRUD | module route/controller/schema/model |
| Booking | workshops route/controller, booking and content models, mail utility |
| Products | route/controller/model/schema |
| Upload/images | upload route, path middleware, `onSend`, schemas, people controllers |
| Deployment | scripts, workflow, environment contract, persistent public storage |

## 3. Feature-change workflow

Before coding, decide public/protected access, role/ownership, VI/EN migration and rollback, request/response/error contract, one language selector, and side-effect failure semantics.

During implementation:

1. Add runtime Zod validation, not only TypeScript casts.
2. Keep transport/schema/auth in routes.
3. Move multi-model/external orchestration into a service layer.
4. Use parameterized SQL and whitelist dynamic column names.
5. Throw mapped domain errors.
6. Add unit, route, and DB integration tests for VI and EN.
7. Update inventory, API reference, sequence diagrams, and both languages.

Expected pre-merge commands are `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the future test command. Lint is currently red and requires an explicit remediation baseline.

## 4. Known risks

| Severity | Source-backed risk | Impact |
|---|---|---|
| Critical | No guards on write/admin/export/upload routes | Data change/deletion, PII leakage, arbitrary uploads |
| Critical | Google login does not verify Google identity | Member impersonation |
| Critical | Hard-coded secret fallbacks | DB/JWT compromise |
| High | 500 connections per raw language key | Database exhaustion |
| High | Unvalidated language keys create cached pools | Resource exhaustion |
| High | No upload MIME/auth/scanning policy | Malicious content and disk exhaustion |
| High | Local/in-memory state | Loss and multi-instance divergence |
| High | Public booking/quotation PII | Privacy incident |
| High | Password hash embedded in URL token | Browser/log/referrer exposure |
| Medium | No global error contract | Unstable clients and information leakage |
| Medium | Non-transactional email/file effects | Inconsistent state |
| Medium | No migrations/tests/OpenAPI | Schema drift and regression |
| Medium | Source string mojibake | Broken user-facing text |
| Medium | CI lacks quality/smoke/rollback gates | Production defects |

## 5. README discrepancies not to perpetuate

- Global code reads query `lang`, not `x-custom-lang`; only services uses the header.
- Members routes manage in-memory registrations, not a database member list.
- DIY/course/post hide PATCH routes described by README do not exist.
- Product/workshop pagination is not implemented.
- “Admin” endpoints have no guard.
- Verification JWT lasts seven days, not a separately short lifetime.
- XLSX export uses ExcelJS; Google Sheets code is unregistered.

## 6. Improvement backlog

### Phase 0: contain exposure

Protect privileged endpoints, repair Google authentication, rotate secrets, reduce pool limits, validate `lang`, add file policy/rate limiting, and restrict PII.

### Phase 1: establish reliability

Add global error handling, structured redacted logs, migration tooling, `.env.example`, startup environment validation, tests, CI gates, and one locale/response convention.

### Phase 2: separate responsibilities

Introduce booking/account/quotation services, an outbox or job queue for email, object storage and safe media cleanup, revocable sessions/refresh rotation, audit logs, and an OpenAPI contract derived from Zod or another single source.

## 7. Incident checks

- For 5xx: identify route/language, inspect pool timeout/schema drift, separate primary failures from mail/file warnings, and verify `BASE_PATH` for 404/static issues.
- For upload/static: check working directory, media path, permissions, disk, URL components, and stored leading-slash conventions; back up before file operations.
- For login/mail: check the correct language DB, member versus guest table, password hash, cross-instance JWT secret consistency, Gmail credentials/quota, and never log tokens/passwords.

## 8. Handover completion criteria

Assign owners for code, both databases, domain/proxy, Gmail, FTP/cPanel, and webhook. Supply DDL/migrations and backup runbooks, rotate secrets, approve and implement the permission matrix, make quality gates green, rehearse staging deploy/rollback, and keep all 18 documents synchronized with contract changes.

