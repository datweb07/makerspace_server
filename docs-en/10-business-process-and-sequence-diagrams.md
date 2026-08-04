# Business Processes and Sequence Diagrams

> Diagrams include only source-backed components. Most modules have no separate service layer; their controllers perform orchestration. The repository contains no active cron job, queue, or worker.

## 1. Bilingual database selection

```mermaid
sequenceDiagram
    participant C as Client
    participant H as Global preHandler
    participant R as Route/controller
    participant M as Model
    participant P as getPool
    participant VI as VI database
    participant EN as EN database
    C->>H: Request with optional query lang
    H->>H: request.lang = query.lang or vi
    H->>R: request
    R->>M: operation with language
    M->>P: getPool(lang)
    alt exact lang equals en
        P->>EN: query
        EN-->>P: rows
    else any other value
        P->>VI: query
        VI-->>P: rows
    end
    P-->>M: result
    M-->>R: data
    R-->>C: response
```

Quotation routes are the exception and read `x-custom-lang`; search reads query `lang` itself.

## 2. Password and Google-whitelist login

```mermaid
sequenceDiagram
    participant C as Client
    participant U as loginUser
    participant A as AccountModel
    participant D as PostgreSQL
    participant B as bcrypt
    participant J as JWT signer
    C->>U: POST login body
    alt auth_provider equals google
        U->>A: findMemberByEmail
        A->>D: SELECT member
        alt not found
            U-->>C: 404
        else found
            U->>J: sign member payload
            U-->>C: 200 token
        end
    else password flow
        U->>A: member lookup then optional guest lookup
        A->>D: SELECT account tables
        U->>B: compare password and hash
        alt mismatch or missing
            U-->>C: 401 or 404
        else match
            U->>J: sign account payload
            U-->>C: 200 token
        end
    end
```

No Google API or Google-issued token is involved in the Google branch.

## 3. Guest registration and activation

```mermaid
sequenceDiagram
    participant C as Client
    participant U as User controller
    participant A as AccountModel
    participant D as PostgreSQL
    participant B as bcrypt
    participant J as JWT
    participant N as Gmail
    C->>U: register email/password
    par duplicate checks
        U->>A: guest lookup
        A->>D: SELECT guests
        U->>A: member lookup
        A->>D: SELECT members
    end
    U->>B: hash with cost 10
    U->>J: sign email and passwordHash for 7d
    U->>N: send verification URL
    U-->>C: 201 or mail-related 500
    C->>U: verify token
    U->>J: verify JWT
    U->>A: duplicate check then insertGuest
    A->>D: SELECT then INSERT
    U-->>C: 200 activated
```

## 4. CMS create/update

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Resource route
    participant V as Zod compiler
    participant K as Controller
    participant M as Resource model
    participant D as Language database
    C->>R: POST or PUT JSON
    R->>V: validate and transform image path
    alt invalid
        V-->>C: Fastify validation response
    else valid
        V->>K: body
        K->>M: insert or dynamic update
        M->>D: parameterized SQL RETURNING all
        alt PostgreSQL 23505
            D-->>K: error
            K-->>C: 400 duplicate slug
        else update returns no row
            D-->>K: empty result
            K-->>C: 404
        else success
            D-->>K: row
            K-->>C: message and data
        end
    end
```

Careers validates manually in its controller. No authentication guard exists on these routes.

## 5. Product create/update

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Products route
    participant P as Controller/model
    participant D as PostgreSQL
    C->>R: validated product body
    R->>P: create or update
    P->>D: SELECT category by exact name
    D-->>P: category id or empty
    P->>P: derive slug, price, specs JSON
    alt create
        P->>D: INSERT item RETURNING id
    else update
        P->>D: UPDATE item
    end
    P->>D: re-read joined item
    D-->>P: row
    P->>P: map DTO and vi-VN price
    P-->>C: direct product or 404
```

## 6. File upload and static serving

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Upload wildcard route
    participant M as Upload path middleware
    participant F as Filesystem
    participant S as Static plugin
    C->>R: multipart request at a subpath
    R->>M: preHandler
    M->>M: derive path, reject dot-dot, check boundary
    M->>F: create directory recursively
    M-->>R: full destination path
    R->>R: read one file and generate name
    R->>F: stream to disk
    F-->>R: completed
    R-->>C: relative public image URL
    C->>S: GET static URL
    S->>F: read bytes
    S-->>C: file
```

The handler has no MIME allowlist or authentication.

## 7. Workshop booking submission

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Workshops route
    participant W as Workshops controller
    participant B as Booking model
    participant D as PostgreSQL
    participant X as DIY/course model
    participant N as Gmail
    C->>R: POST registration
    R->>R: Zod validation
    R->>W: createRegistration
    W->>B: insert pending booking
    B->>D: INSERT
    D-->>W: booking row
    opt type is diy or short_course
        W->>X: lookup title by slug
        X->>D: SELECT
        D-->>W: content row
    end
    W->>N: received email
    opt email failure
        W->>W: log and retain booking
    end
    W-->>C: booking row
```

## 8. Booking approval/cancellation

```mermaid
sequenceDiagram
    participant O as Operator client
    participant W as Workshops controller
    participant B as Booking model
    participant D as PostgreSQL
    participant X as Workshop content model
    participant N as Gmail
    O->>W: PATCH id and validated status
    W->>B: updateStatus
    B->>D: UPDATE RETURNING
    alt no row
        W-->>O: unhandled Booking not found error
    else approved or cancelled
        W->>X: lookup title and optional schedule/location
        X->>D: SELECT by slug
        alt approved
            W->>N: approval email
        else cancelled
            W->>N: cancellation email
        end
        opt mail failure
            W->>W: log only
        end
        W-->>O: updated booking
    else pending
        W-->>O: updated booking without email
    end
```

The operator endpoint currently has no authentication or RBAC.

## 9. Service quotation request

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Services route
    participant S as Services controller
    participant M as Services model
    participant D as PostgreSQL
    participant G as Gmail
    C->>R: validated quote request
    R->>S: input and custom language header
    S->>M: createQuoteRequest
    M->>D: INSERT services.b2b
    D-->>S: inserted row
    par requester email
        S->>G: confirmation
    and admin email
        S->>G: request details
    end
    opt any email rejects
        S->>S: catch and log
    end
    S-->>C: inserted row
```

## 10. Global search

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Search controller
    participant M as Search model
    participant D as Language database
    C->>S: GET with q and lang
    alt q missing
        S-->>C: 400
    else q present
        S->>M: globalSearch(q, lang)
        M->>D: parameterized ILIKE UNION ALL, LIMIT 20
        D-->>M: rows by created_at descending
        M-->>S: QueryResult
        S-->>C: status/message/data
    end
```

## 11. XLSX booking export

```mermaid
sequenceDiagram
    participant C as Client
    participant W as Workshops controller
    participant B as Booking model
    participant D as PostgreSQL
    participant E as ExcelJS
    C->>W: GET export
    W->>B: getAll(language)
    B->>D: SELECT bookings and DIY title
    D-->>W: all rows
    W->>W: sort and group by month
    W->>E: build worksheet
    E-->>W: XLSX buffer
    W-->>C: binary response and filename headers
```

The flow is unauthenticated, unpaginated, and non-streaming.

## 12. Deployment workflow

```mermaid
sequenceDiagram
    participant G as GitHub main
    participant B as Build job
    participant A as Artifact store
    participant D as Deploy job
    participant F as FTP server
    participant H as Unzip webhook
    G->>B: push or manual dispatch
    B->>B: checkout, Node 20, npm ci, build, zip
    B->>A: upload one-day artifact
    D->>A: download
    D->>F: upload deploy.zip only
    D->>H: call unzip URL with key
```

## 13. Cron jobs and synchronization

No active cron, runtime scheduler, queue, worker, or synchronization route exists. `schedules.model.ts` has table CRUD but no controller/route. The Google Sheets controller can append a row but is not registered, so it is not a runtime business workflow.

