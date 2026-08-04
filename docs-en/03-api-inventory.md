# API Inventory

## 1. Conventions and count

`{API}` means `/api` when `BASE_PATH` is empty, otherwise `<BASE_PATH>/api`. Every endpoint passes through the global language `preHandler` and image-rewriting `onSend` hook. “Public” means the current code does not verify a token; it does not assert that public access is desirable. The inventory contains 97 endpoints: 4 root endpoints and 93 endpoints across 18 route groups.

## 2. Root, utilities, and users

| Module | Method | Path | Validation/hooks | Handler | Model/integration | Access and notes |
|---|---|---|---|---|---|---|
| Root | GET | `/` | Global | inline | None | Public welcome |
| Root | GET | `/makerspace_server` | Global | inline | None | Public alias |
| Root | GET | `/makerspace_server/ping` | Global | inline | None | Public ping |
| Root | GET | `/health` | Global | inline | None | Public; no dependency checks |
| Utils | GET | `{API}/utils/health` | Global | `health` | None | Public |
| Utils | GET | `{API}/utils/meta` | Global | inline | None | Public hard-coded metadata |
| Users | POST | `{API}/users/login` | `LoginBody`, success response | `loginUser` | accounts, bcrypt, JWT | Public; password or Google email whitelist |
| Users | POST | `{API}/users/register` | `RegisterBody` | `registerGuest` | accounts, bcrypt, mail, JWT | Public; sends verification |
| Users | POST | `{API}/users/verify` | token object | `verifyGuest` | accounts, JWT | Token possession; creates guest |
| Users | POST | `{API}/users/checked-valid-session` | None | inline | JWT verifier | Raw Authorization token |
| Users | GET | `{API}/users/profile` | None | `getProfile` | accounts, JWT | Raw token |
| Users | PUT | `{API}/users/profile` | No body schema | `updateProfile` | accounts, JWT | Raw token; guest only |

## 3. Products and categories

| Method | Path | Validation | Handler/model | Access | Notes |
|---|---|---|---|---|---|
| GET | `{API}/products/` | list query | list/controller/model | Public | In-memory exact category filter |
| GET | `{API}/products/categories` | None | list categories | Public | Includes drafts |
| POST | `{API}/products/categories` | name, optional slug | create category | Public | Generates slug if absent |
| PUT | `{API}/products/categories/:id` | id and category body | update category | Public | 404 on zero rows |
| DELETE | `{API}/products/categories/:id` | id | delete category | Public | Hard delete |
| PATCH | `{API}/products/categories/:id/hide` | id, draft boolean | toggle category draft | Public | No RBAC |
| GET | `{API}/products/:id` | id | find product | Public | Direct DTO or 404 |
| POST | `{API}/products/` | create product | create product | Public | Generated slug suffix |
| PUT | `{API}/products/:id` | id, full update body | update product | Public | Update schema is not partial |
| DELETE | `{API}/products/:id` | id | delete product | Public | Hard delete |
| PATCH | `{API}/products/:id/hide` | id, draft boolean | toggle item draft | Public | Visibility flag |

## 4. Workshop aggregate and bookings

| Method | Path | Validation | Handler/model | Access | Notes |
|---|---|---|---|---|---|
| GET | `{API}/workshops/` | workshop query | static workshop model | Public | Page/limit accepted but unused |
| GET | `{API}/workshops/featured` | None | featured static list | Public | Hard-coded data |
| GET | `{API}/workshops/:id` | id | inline static lookup | Public | Direct object |
| POST | `{API}/workshops/registrations` | registration schema | booking/content/mail | Public | Inserts pending booking |
| GET | `{API}/workshops/registrations` | None | booking list | Public | Admin-like PII endpoint unguarded |
| GET | `{API}/workshops/registrations/me` | None | account + booking | Raw token | Email ownership lookup |
| POST | `{API}/workshops/registrations/find` | None | contact lookup | Public | Unvalidated body |
| POST | `{API}/workshops/registrations/absence` | None | append JSONB request | Public | No ownership check |
| DELETE | `{API}/workshops/registrations/absence/:booking_id/:index` | None | remove JSONB index | Public | Unvalidated integer |
| GET | `{API}/workshops/registrations/export` | None | booking + ExcelJS | Public | Full XLSX export |
| PATCH | `{API}/workshops/registrations/:id/status` | status enum | update + email | Public | pending/approved/cancelled |
| DELETE | `{API}/workshops/registrations/:id` | None | booking delete | Public | Generic throw on missing row |

## 5. DIY and short courses

| Module | Method | Path | Schema | Controller/model | Access | Notes |
|---|---|---|---|---|---|---|
| DIY | GET | `{API}/workshops/diy/` | None | list/`diyModel` | Public | Aggregates non-cancelled participants |
| DIY | GET | `{API}/workshops/diy/:id` | None | by id | Public | 404 if missing |
| DIY | GET | `{API}/workshops/diy/slug/:slug` | None | by slug | Public | Aggregate detail |
| DIY | POST | `{API}/workshops/diy/` | create DIY | insert | Public | Database write |
| DIY | PUT | `{API}/workshops/diy/:id` | partial update | update | Public | Dynamic columns |
| DIY | DELETE | `{API}/workshops/diy/:id` | None | delete | Public | Does not remove image |
| Course | GET | `{API}/workshops/short_courses/` | None | list/course model | Public | Created descending |
| Course | GET | `{API}/workshops/short_courses/:id` | None | by id | Public | Detail |
| Course | GET | `{API}/workshops/short_courses/slug/:slug` | None | by slug | Public | Detail |
| Course | POST | `{API}/workshops/short_courses/` | create course | insert | Public | Writes 21 columns |
| Course | PUT | `{API}/workshops/short_courses/:id` | partial update | update | Public | Dynamic columns |
| Course | DELETE | `{API}/workshops/short_courses/:id` | None | delete | Public | Hard delete |

## 6. People

| Module | Method | Path | Schema | Handler/storage | Access | Notes |
|---|---|---|---|---|---|---|
| Staff | GET | `{API}/people/staff/` | None | list/`people.staff` | Public | Adds `image` alias |
| Staff | GET | `{API}/people/staff/:id` | id string | by id | Public | Entity-specific 404 |
| Staff | POST | `{API}/people/staff/` | create staff | insert | Public | Client supplies id |
| Staff | PUT | `{API}/people/staff/:id` | id + update | update + filesystem | Public | Async old-image delete |
| Staff | DELETE | `{API}/people/staff/:id` | id | delete + filesystem | Public | Best-effort file delete |
| Technicals | GET | `{API}/people/technicals/` | None | list/`people.technicals` | Public | Adds `image` alias |
| Technicals | GET | `{API}/people/technicals/:id` | id | by id | Public | Detail |
| Technicals | POST | `{API}/people/technicals/` | create technical | insert | Public | Database write |
| Technicals | PUT | `{API}/people/technicals/:id` | id + update | update + filesystem | Public | Async old-image delete |
| Technicals | DELETE | `{API}/people/technicals/:id` | id | delete + filesystem | Public | Best effort |
| Intern | GET | `{API}/people/intern/` | None | list/`people.interns` | Public | Display-order sort |
| Intern | GET | `{API}/people/intern/:id` | None | by id | Public | No params schema |
| Intern | POST | `{API}/people/intern/` | create intern | insert | Public | Database write |
| Intern | PUT | `{API}/people/intern/:id` | update intern | update + filesystem | Public | No params schema |
| Intern | DELETE | `{API}/people/intern/:id` | None | delete + filesystem | Public | Best effort |

## 7. CMS posts

| Module | Method | Path | Schema | Controller/model | Access | Notes |
|---|---|---|---|---|---|---|
| News | GET | `{API}/posts/news/` | None | list/`posts.news` | Public | Publish date descending |
| News | GET | `{API}/posts/news/slug/:slug` | None | by slug | Public | Detail |
| News | GET | `{API}/posts/news/:id` | None | by id | Public | Detail |
| News | POST | `{API}/posts/news/` | `CreateNewsBody` | insert | Public | Duplicate slug maps to 400 |
| News | PUT | `{API}/posts/news/:id` | `UpdateNewsBody` | update | Public | Partial |
| News | DELETE | `{API}/posts/news/:id` | None | delete | Public | Hard delete |
| Events | GET | `{API}/posts/events/` | None | list/`posts.events` | Public | Publish date descending |
| Events | GET | `{API}/posts/events/slug/:slug` | None | by slug | Public | Detail |
| Events | GET | `{API}/posts/events/:id` | None | by id | Public | Detail |
| Events | POST | `{API}/posts/events/` | `CreateEventsBody` | insert | Public | Supports event time |
| Events | PUT | `{API}/posts/events/:id` | `UpdateEventsBody` | update | Public | Partial |
| Events | DELETE | `{API}/posts/events/:id` | None | delete | Public | Hard delete |
| Student life | GET | `{API}/posts/student_life/` | None | list/table | Public | Publish date descending |
| Student life | GET | `{API}/posts/student_life/slug/:slug` | None | by slug | Public | Detail |
| Student life | GET | `{API}/posts/student_life/:id` | None | by id | Public | Detail |
| Student life | POST | `{API}/posts/student_life/` | create schema | insert | Public | Database write |
| Student life | PUT | `{API}/posts/student_life/:id` | partial schema | update | Public | Dynamic columns |
| Student life | DELETE | `{API}/posts/student_life/:id` | None | delete | Public | Hard delete |
| Careers | GET | `{API}/posts/careers/` | None | list/`posts.careers` | Public | Publish date descending |
| Careers | GET | `{API}/posts/careers/slug/:slug` | None | by slug | Public | Detail |
| Careers | GET | `{API}/posts/careers/:id` | None | by id | Public | Detail |
| Careers | POST | `{API}/posts/careers/` | Controller `.parse` | insert | Public | Empty route schema object |
| Careers | PUT | `{API}/posts/careers/:id` | Controller `.parse` | update | Public | Zod error details on 400 |
| Careers | DELETE | `{API}/posts/careers/:id` | None | delete | Public | Hard delete |

## 8. Services, contacts, members, upload, and search

| Module | Method | Path | Schema/hook | Handler/storage | Access | Notes |
|---|---|---|---|---|---|---|
| Services | GET | `{API}/services/catalog` | None | static catalog | Public | Process-local data |
| Services | GET | `{API}/services/quote-requests` | None | `services.b2b` | Public | Uses `x-custom-lang` |
| Services | POST | `{API}/services/quote-requests` | quote schema | DB + two emails | Public | `requestType` not persisted |
| Services | DELETE | `{API}/services/quote-requests/:id` | None | delete | Public | Always VI default; always success if query executes |
| Contacts | GET | `{API}/contacts/info` | None | static object | Public | No database |
| Contacts | GET | `{API}/contacts/inquiries` | None | in-memory list | Public | Resets on restart |
| Contacts | POST | `{API}/contacts/inquiries` | inquiry schema | in-memory append | Public | No id/timestamp |
| Members | GET | `{API}/members/registrations` | None | in-memory list | Public | Not database member list |
| Members | POST | `{API}/members/registrations` | member schema | in-memory append | Public | Resets on restart |
| Upload | POST | `{API}/upload/*` | upload path preHandler | local filesystem | Public | One file; no MIME allowlist |
| Search | GET | `{API}/search/` | None | search controller/model | Public | `q` required, `lang` query |

## 9. Business code without an endpoint

| Component | Capability | Why excluded |
|---|---|---|
| `registration.controller.ts` | Append a registration to Google Sheets | No route imports/registers it |
| `schedules.model.ts` | Workshop schedule CRUD | No controller or route |
| `user.model.ts` | User lookup/admin creation | Unused by current controllers |
| `productsController.getCategoryById` | Placeholder | Empty function and no route |

