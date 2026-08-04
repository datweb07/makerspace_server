# Detailed API Reference

## 1. Common conventions

Examples use `/api`; production may prepend `BASE_PATH`. Global language routing reads `?lang=` and defaults to `vi`. Quotation routes instead read `x-custom-lang`. Protected routes expect a raw JWT in `Authorization`, not the Bearer scheme. Upload uses multipart.

> Models frequently return `SELECT *`, while no DDL is present. This reference documents fields proven by source and deliberately does not invent additional database columns.

## 2. System endpoints

- `GET /` and `GET /makerspace_server`: `200 {"ok":true,"message":"Welcome to MakerSpace API Server"}`.
- `GET /makerspace_server/ping`: returns the hard-coded pong/version message.
- `GET /health` and `GET /api/utils/health`: `{"ok":true,"service":"makerspace_server"}` without DB/SMTP checks.
- `GET /api/utils/meta`: hard-coded application name and version.

## 3. Users

### `POST /api/users/login`

Body fields are `username` (minimum three characters), optional `password`, and optional `auth_provider`.

- If `auth_provider === "google"`, the controller looks up `accounts.members.username` and signs a token. It does not validate any Google token.
- Otherwise password is required, member lookup precedes guest lookup, and bcrypt compares the submitted password with the stored hash.
- JWT payload is `userId`, `username`, and role. Tokens expire after seven days.

Success:

```json
{"message":"<success message>","data":{"token":"<jwt>","expires":"<now plus seven days ISO>"}}
```

Errors: 400 missing password, 401 mismatch, 404 unknown account/email, 500 exception.

### `POST /api/users/register`

Requires an email-form username and a password at controller level. Guest/member duplicate checks run in parallel. The password is bcrypt-hashed with cost 10, placed with the email in a seven-day verification JWT, and emailed as a query parameter. No database row is written at this stage. Success is 201; duplicate is 409.

### `POST /api/users/verify`

Body is `{"token":"<verification JWT>"}`. The controller requires `username` and `passwordHash` claims, checks for an existing guest, and inserts `accounts.guests` with role `guest` and provider `password`. Success 200; malformed shape 400; already active 409. Signature/expiry failures fall into the generic 500 catch.

### Session and profile routes

| Endpoint | Input and processing | Success/errors |
|---|---|---|
| `POST /users/checked-valid-session` | Raw Authorization JWT; no account lookup | 200 returns same token and a newly calculated `now+7d` timestamp; 401 invalid |
| `GET /users/profile` | Verify, guest lookup then member lookup, remove password | 200 `{data:profile}`; 401 missing; 404 account; verify exception can be 500 |
| `PUT /users/profile` | Unvalidated `fullname`, `phone`; update guest only | 200 message; 403 member/not found; 401 missing; 500 exception |

## 4. Products

The product response DTO contains `id`, `name`, category name/fallback, material from `specs`, locale-formatted price or contact text, description from `content`, `image`, `images`, and `draft`.

- `GET /api/products?category=<exact>`: loads all joined rows and filters exact category in memory; returns `{data,total}`. No pagination or draft filtering.
- `GET /api/products/:id`: numeric lookup; direct DTO or 404.
- `POST /api/products`: requires name/category/material/price/description/image, optional images/slug. Category is resolved by exact name; price strips non-digit/dot characters; specs is JSON; slug receives a four-digit timestamp suffix. Returns a direct DTO.
- `PUT /api/products/:id`: full body, not partial; updates mapped fields and re-reads the item. Direct DTO or 404.
- `DELETE /api/products/:id`: hard delete and success message, or 404.
- `PATCH /api/products/:id/hide`: body `{"draft":true}`, visibility success message or 404.

Category routes list `{id,name,slug,draft}`, create from `{name,slug?}`, update the same fields, hard-delete, or toggle `draft`. Missing slugs are derived by lowercasing, removing combining marks, replacing spaces/underscores, and stripping non-ASCII slug characters. Id operations return 404 when no row changes.

## 5. Static workshop catalog

- `GET /api/workshops`: accepts coerced `limit`, `page`, and optional `tag`; only exact tag is used. Returns six hard-coded workshop records as `{data,total}`.
- `GET /api/workshops/featured`: filters hard-coded records by `featured`.
- `GET /api/workshops/:id`: returns one hard-coded object directly or 404.

## 6. Bookings

### Create

`POST /api/workshops/registrations` requires `workshop_id`, non-empty `workshop_type`, name, phone, valid email, participants at least one, and optional note. It inserts `pending`, optionally resolves a DIY/course title by slug, and sends a best-effort receipt email. It returns the inserted row directly.

```json
{"workshop_id":"slug","workshop_type":"diy","name":"Name","email":"a@example.com","phone":"0900","participants":1,"note":"optional"}
```

### Read and lookup

- `GET /registrations`: returns all bookings joined only to DIY as `{data}`; currently public.
- `GET /registrations/me`: raw JWT, account lookup, then email-filtered bookings joined to DIY/course; 401/404 handling exists.
- `POST /registrations/find`: unvalidated equality lookup on email, phone, workshop id, and type; `{data:row}` or 404.

### Absence, status, delete, export

- `POST /registrations/absence`: unvalidated booking id/date/reason; appends a timestamped object to JSONB.
- `DELETE /registrations/absence/:booking_id/:index`: removes JSONB array index. Neither route checks ownership or missing rows.
- `PATCH /registrations/:id/status`: validates `pending|approved|cancelled`, updates first, then sends approval/cancellation email after workshop lookup. Missing booking throws a generic error.
- `DELETE /registrations/:id`: hard delete; missing row throws a generic error.
- `GET /registrations/export`: loads all rows, sorts by creation time, groups worksheet rows by month, and returns `workshop_bookings.xlsx`. It is unauthenticated.

## 7. DIY and short-course CRUD

DIY create requires title and slug; optional fields are cover image, content, difficulty, draft, start/end time, location, and coerced maximum participants. Update is partial. List/by-id/by-slug aggregate non-cancelled booking participants. Create/update/delete return message/data or 404; PostgreSQL `23505` maps to 400 duplicate slug.

Short-course create requires title and slug and accepts cover image, content, duration, nonnegative price, location, language, level, experience requirements, objectives, arbitrary structure/offer/summarize values, draft, times, schedule details, maximum participants, type, and status. Update is partial. Its six list/detail/create/update/delete endpoints follow the DIY response/error pattern, but list does not aggregate bookings.

Both image schemas strip the host when an absolute URL contains `public/static/images/...`.

## 8. CMS resources

News and student-life create bodies require title, slug, cover image, content, author, and publish date; description is nullable/optional and draft defaults false. Events adds nullable/optional event time. Updates are partial.

Careers requires title, slug, and deadline; status is `open|closed`, with optional content, coerced publish date, and draft. Its controller manually parses Zod input.

For each resource (`news`, `student_life`, `events`, `careers`):

| Operation | Behavior |
|---|---|
| `GET /api/posts/<resource>` | `SELECT *`, publish date descending, `{data:[rows]}` |
| `GET .../slug/:slug` | `{data:row}` or 404 |
| `GET .../:id` | `{data:row}` or 404 |
| `POST .../` | Insert, `{message,data}`; duplicate slug maps to 400 |
| `PUT .../:id` | Dynamic partial update; careers does not set `updated_at` explicitly |
| `DELETE .../:id` | Hard delete, message or 404 |

No endpoint filters draft content or enforces editor permissions.

## 9. People resources

Staff/technicals create requires client-supplied id, name, and cover image; title, bio, nullable/empty email, display order, and draft are optional. Intern omits email. Updates omit id and are partial.

Each `/api/people/staff`, `/technicals`, and `/intern` prefix supports list, by-id, create, update, and delete. Lists order by display order then id and alias `image=cover_image`. Update reads the old row and asynchronously deletes a changed prior image. Delete removes the DB row and best-effort deletes its image. Errors use entity-specific 404 messages or generic 500.

## 10. Services

- `GET /api/services/catalog`: returns three static objects with model, title, description, features, CTA/path, and colors.
- `POST /api/services/quote-requests`: validates full name, email, phone, description, optional company and request-type array. It persists every field except `requestType`, then sends requester/admin emails in parallel. Email failure is logged; inserted row is still returned.
- `GET /api/services/quote-requests`: selects language via `x-custom-lang`, returns newest first.
- `DELETE /api/services/quote-requests/:id`: fails to forward language, therefore uses VI by default; returns success even when no row exists.

## 11. Contacts and members

Contact info is a static object. Contact inquiries require company/contact names, email, phone, detail, and optional request kinds; POST appends and returns the input, GET returns the in-memory array.

Member registrations require type (`student|workshop|booking`), full name, phone, email, with optional student/workshop/practice/equipment fields. POST appends and returns the input; GET returns the array. Both stores reset on process restart.

## 12. Upload

`POST /api/upload/*` uses the wildcard as a directory below `<cwd>/<MEDIA_UPLOAD_FOLDER>/images`. Middleware rejects a raw path containing `..`, checks the resolved prefix, and creates directories. The handler reads one file, preserves the client extension or uses `.jpg`, creates a timestamp/random name, and streams to disk.

Success: `{"url":"public/static/images/<subpath>/<generated name>"}`. Missing file is 400; handler exceptions are 500. There is no authentication, MIME allowlist, antivirus scan, or cleanup transaction.

## 13. Search

`GET /api/search?q=<text>&lang=<language>` requires `q`; missing q returns 400 with `status` and `message`. SQL uses `%q%` with parameterized `ILIKE` against title/description across news, events, student life, and short courses, orders by creation time, and limits to 20. Success is `{status:200,message,data}`. Failure includes raw `error.message` in the 500 response.

## 14. Error contract caveat

Controller responses, Fastify validation responses, and unhandled Fastify errors have different shapes because no global error handler exists. Clients must not assume all errors are `{message}` until a versioned contract is introduced.

