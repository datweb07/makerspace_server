## Overview

The backend API service for the UEH MakerSpace web platform. It is built with Fastify and TypeScript, serving a bilingual (Vietnamese and English) content management and user-facing data API. The server connects to two separate PostgreSQL databases, one for Vietnamese content and one for English content and handles all business logic for the MakerSpace website frontend.

The server exposes a RESTful API under the base prefix `/api` (or `/makerspace_server/api` when deployed with a base path). It is designed to be run as a standalone Node.js process and does not use an ORM; all database queries are written directly using the `pg` library.


## Technology Stack

- **Runtime**: Node.js (ES2022 target)
- **Framework**: Fastify 5
- **Language**: TypeScript
- **Database driver**: `pg` (node-postgres)
- **Authentication**: JWT via `fast-jwt`, session cookies via `@fastify/session` and `@fastify/cookie`
- **Email**: Nodemailer with Gmail SMTP
- **File uploads**: `@fastify/multipart`
- **Static files**: `@fastify/static`
- **Schema validation**: Zod with `fastify-type-provider-zod`
- **Build tool**: TypeScript compiler (`tsc`) with `tsc-alias` for path aliasing
- **Development runner**: `nodemon` with `tsx`
- **Excel export**: `exceljs`
- **Google Sheets integration**: `google-spreadsheet`


## Dual-Language Database Architecture

The server operates against two separate PostgreSQL databases simultaneously. The target database for any given request is determined by the `x-custom-lang` request header:

- When the header value is `en`, the server connects to the English database.
- When the header value is `vi` (or when the header is absent), the server connects to the Vietnamese database.

The `getPool(lang)` function in `src/models/db/pool.ts` manages this routing. It maintains a lazy-initialized map of connection pools, creating a new pool on first use for each language key and reusing it on subsequent calls. Each pool uses its own connection credentials, host, and database name as configured via environment variables.

This design allows the same API endpoints to serve content in either language without any code duplication at the route or controller level.


## API Prefix and Base Path

The `DEFAULT_API_PREFIX` constant is computed from the `BASE_PATH` environment variable:

- If `BASE_PATH` is set (e.g., `/makerspace_server`), the prefix becomes `/makerspace_server/api`.
- If `BASE_PATH` is not set, the prefix is `/api`.

All route groups are registered under this prefix in `src/index.ts`.

## Environment Variables

All configuration is loaded from `.env` via `dotenv` and accessed through the typed config object in `src/config.ts`. The following variables are recognized:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `BASE_PATH` | URL base path prefix for subdirectory deployments |
| `POSTGRES_DB_HOST` | Default PostgreSQL host (used when per-language host is not set) |
| `POSTGRES_DB_HOST_VI` | PostgreSQL host for the Vietnamese database |
| `POSTGRES_DB_HOST_EN` | PostgreSQL host for the English database |
| `POSTGRES_USER` | Default PostgreSQL user |
| `POSTGRES_USER_VI` | PostgreSQL user for the Vietnamese database |
| `POSTGRES_USER_EN` | PostgreSQL user for the English database |
| `POSTGRES_PASSWORD` | Default PostgreSQL password |
| `POSTGRES_PASSWORD_VI` | Password for the Vietnamese database |
| `POSTGRES_PASSWORD_EN` | Password for the English database |
| `POSTGRES_DB_VI` | Database name for Vietnamese content |
| `POSTGRES_DB_EN` | Database name for English content |
| `POSTGRES_DB_PORT` | PostgreSQL connection port |
| `SESSION_TOKEN_SECRET` | Secret key for signing and verifying JWT session tokens |
| `JWT_SECRET` | General-purpose JWT secret |
| `CORS_ORIGIN` | Allowed CORS origin |
| `SERVER_PROTOCOL` | Protocol used to construct public media URLs |
| `SERVER_DOMAIN` | Domain used to construct public media URLs |
| `EMAIL_APP_USERNAME` | Gmail address used as the SMTP sender |
| `EMAIL_APP_PASS` | Gmail application password for SMTP authentication |
| `EMAIL_RECEIVER` | Default admin email address for inbound notification emails |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account email for Sheets integration |
| `GOOGLE_PRIVATE_KEY` | Private key for the Google service account |
| `GOOGLE_SHEET_ID` | Google Sheet ID used for data export |
| `MEDIA_UPLOAD_FOLDER` | Root directory for uploaded media files |

## Running the Server

### Prerequisites

- Node.js 18 or higher
- npm
- A running PostgreSQL instance accessible at the configured host and port
- A `.env` file populated with valid values

### Development

Start the development server with hot-reload via nodemon and tsx:

```bash
npm run dev
```

Nodemon watches the `src/` directory and `config.ts` for TypeScript and JSON file changes, and restarts the server using `tsx src/index.ts` on each change.

### Production Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

This command removes the existing `dist/` directory, runs the TypeScript compiler, and then runs `tsc-alias` to resolve any path aliases in the output.

### Production Start

After building, start the compiled server:

```bash
npm start
```

This executes `node dist/index.js`.

## API Endpoints

All routes are registered under `DEFAULT_API_PREFIX`. The descriptions below use `/api` as the base.

### Authentication and Users - `/api/users`

| Method | Path | Description |
|---|---|---|
| POST | `/api/users/login` | Authenticate with username and password, returns a session token |
| POST | `/api/users/register` | Register a new guest account, triggers verification email |
| POST | `/api/users/verify` | Verify a guest account using a token received via email |
| POST | `/api/users/checked-valid-session` | Validate an existing session token |
| GET | `/api/users/profile` | Get the profile of the authenticated user |
| PUT | `/api/users/profile` | Update the profile of the authenticated user |

### Workshops (DIY) - `/api/workshops`

| Method | Path | Description |
|---|---|---|
| GET | `/api/workshops` | List all workshops with optional query filters |
| GET | `/api/workshops/featured` | List featured workshops |
| GET | `/api/workshops/:id` | Get a single workshop by ID |
| POST | `/api/workshops/registrations` | Submit a workshop booking registration |
| GET | `/api/workshops/registrations` | List all workshop registrations (admin) |
| GET | `/api/workshops/registrations/me` | List registrations belonging to the authenticated user |
| POST | `/api/workshops/registrations/find` | Find a specific registration by email, phone, and workshop |
| POST | `/api/workshops/registrations/absence` | Submit an absence request for a booking |
| DELETE | `/api/workshops/registrations/absence/:booking_id/:index` | Remove an absence request |
| GET | `/api/workshops/registrations/export` | Export all registrations as an Excel file |
| PATCH | `/api/workshops/registrations/:id/status` | Update the approval status of a booking |
| DELETE | `/api/workshops/registrations/:id` | Delete a workshop registration |

### DIY Workshop Content - `/api/workshops/diy`

Provides CRUD operations for DIY workshop content items (title, description, schedule, images, draft status). Endpoints follow the pattern `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, and `PATCH /:id/hide`.

### Short Courses - `/api/workshops/short_courses`

Same CRUD pattern as DIY workshops but for short course content items.

### Products - `/api/products`

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products with optional category filter and pagination |
| GET | `/api/products/categories` | List all product categories |
| POST | `/api/products/categories` | Create a new product category |
| PUT | `/api/products/categories/:id` | Update a product category |
| DELETE | `/api/products/categories/:id` | Delete a product category |
| PATCH | `/api/products/categories/:id/hide` | Toggle the draft (hidden) state of a category |
| GET | `/api/products/:id` | Get a product by ID |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/hide` | Toggle the draft (hidden) state of a product |

### Services - `/api/services`

| Method | Path | Description |
|---|---|---|
| GET | `/api/services/catalog` | Get the static service catalog list |
| GET | `/api/services/quote-requests` | List all B2B service quote requests (admin) |
| POST | `/api/services/quote-requests` | Submit a new B2B service quote request from the public form |
| DELETE | `/api/services/quote-requests/:id` | Delete a quote request by ID |

When a quote request is submitted, the system sends two emails simultaneously: a confirmation email to the address provided in the form, and a notification email to the admin receiver address configured in `EMAIL_RECEIVER`.

### Members - `/api/members`

Exposes a single `GET /api/members` endpoint that returns the list of MakerSpace members from the database.

### People - Staff, Technicals, Interns

Three separate route groups with identical CRUD patterns:

- `/api/people/staff`
- `/api/people/technicals`
- `/api/people/intern`

Each supports `GET /`, `POST /`, `GET /:id`, `PUT /:id`, and `DELETE /:id`.

### Posts - News, Student Life, Events, Careers

Four separate route groups for CMS-style content posts:

- `/api/posts/news`
- `/api/posts/student_life`
- `/api/posts/events`
- `/api/posts/careers`

Each supports `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, and `PATCH /:id/hide` for draft toggling.

### Contacts - `/api/contacts`

| Method | Path | Description |
|---|---|---|
| GET | `/api/contacts/info` | Get MakerSpace contact details (address, hotline, email, work hours) |
| GET | `/api/contacts/inquiries` | List submitted contact inquiries (in-memory, non-persistent) |
| POST | `/api/contacts/inquiries` | Submit a contact inquiry |

### Search - `/api/search`

Provides a global search endpoint that queries across multiple content domains.

### File Upload - `/api/upload`

Accepts multipart file uploads at any sub-path under `/api/upload`. The uploaded file is saved under `public/static/images/<sub-path>/` with a timestamped filename. The middleware `processUploadPath` validates and creates the target directory before the upload handler runs. The endpoint returns the relative file URL.

### Utilities - `/api/utils`

Internal utility endpoints used by the system.

## Authentication System

User authentication is session-token based using JWT:

- On successful login, the server signs a JWT using `SESSION_TOKEN_SECRET` and returns it to the client.
- The client includes this token in the `Authorization` header for protected requests.
- The server verifies the token using `verifySessionToken` from `src/utils/jwt.ts`.
- Tokens expire after 7 days.
- Guest accounts must verify their email address before they can log in. A verification link containing a short-lived token is sent via email.

## Email System

All email functions are located in `src/utils/mail.ts`. A single Nodemailer transporter is created at module load time using the Gmail SMTP service with the credentials from `EMAIL_APP_USERNAME` and `EMAIL_APP_PASS`.

The following email functions are exported:

| Function | Trigger | Description |
|---|---|---|
| `sendVerificationEmail` | Guest registration | Sends an account verification link to the new user |
| `sendBookingReceivedEmail` | Workshop booking submitted | Confirms receipt of a booking registration to the user |
| `sendBookingApprovedEmail` | Booking status set to approved | Notifies the user that their booking has been approved |
| `sendBookingCancelledEmail` | Booking status set to cancelled | Notifies the user that their booking has been cancelled |
| `sendServiceQuoteEmail` | B2B quote request submitted | Sends a confirmation email to the person who submitted the quote form |
| `sendServiceQuoteAdminEmail` | B2B quote request submitted | Sends a notification email with full form details to the admin address |

## Image URL Processing

When a response payload contains image paths stored in the format `public/static/images/...`, an `onSend` hook in `src/index.ts` rewrites them to absolute URLs using `SERVER_PROTOCOL` and `SERVER_DOMAIN`. For example, `public/static/images/workshops/photo.jpg` becomes `https://iscm-api.ueh.edu.vn/makerspace_server/public/static/images/workshops/photo.jpg` when deployed in production.

## CORS Policy

CORS is configured to allow requests from the following origins:

- Any request with no origin header (server-to-server)
- `localhost` and `127.0.0.1` on any port
- Any subdomain of `ueh.edu.vn`
- Any origin containing `vercel.app`

All standard HTTP methods including `DELETE`, `PATCH`, and `OPTIONS` are permitted.

## Development Notes

- The `lang` property is attached to every `FastifyRequest` object. It is populated from the `x-custom-lang` request header and defaults to `vi`. This augmentation is declared in `src/type.d.ts`.
- The `processUploadPath` middleware performs path traversal validation before allowing file writes, ensuring uploaded files cannot escape the configured media directory.
- Zod schemas defined in `src/schemaValidation/` serve dual purposes: they are used for runtime request validation by Fastify and they export TypeScript types inferred from the schema for use in controllers and models.
- The Google Sheets integration is used for certain data export operations via the `google-spreadsheet` library, authenticated with a service account key.
