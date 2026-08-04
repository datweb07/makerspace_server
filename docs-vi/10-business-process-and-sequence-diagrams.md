# Quy trình nghiệp vụ và sơ đồ tuần tự

> Sơ đồ chỉ thể hiện các thành phần thực sự có trong code. Không có lớp Service độc lập cho đa số module; node `Controller` bên dưới chính là nơi điều phối. Repository không có cronjob/queue/worker đang hoạt động.

## 1. Chọn database song ngữ

```mermaid
sequenceDiagram
    participant C as Client
    participant H as Global preHandler
    participant R as Route/Controller
    participant M as Model
    participant P as getPool
    participant VI as DB VI
    participant EN as DB EN
    C->>H: Request ?lang=en hoặc không có
    H->>H: request.lang = query.lang ?? vi
    H->>R: request
    R->>M: operation(..., request.lang)
    M->>P: getPool(lang)
    alt lang đúng bằng en
        P->>EN: query
        EN-->>P: rows
    else mọi giá trị khác
        P->>VI: query
        VI-->>P: rows
    end
    P-->>M: result
    M-->>R: data
    R-->>C: JSON
```

Ngoại lệ: quote requests lấy `x-custom-lang`; search tự đọc query `lang`.

## 2. Login password và Google whitelist

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Users route
    participant U as loginUser
    participant A as AccountModel
    participant D as PostgreSQL
    participant B as bcrypt
    participant J as JWT signer
    C->>R: POST /users/login
    R->>U: validated body
    alt auth_provider bằng google
        U->>A: findMemberByEmail(username)
        A->>D: SELECT accounts.members
        alt member không tồn tại
            U-->>C: 404
        else member tồn tại
            U->>J: sign member payload
            U-->>C: 200 token
        end
    else password flow
        U->>A: findMemberByEmail
        A->>D: SELECT member
        opt member không có
            U->>A: findGuestByUsername
            A->>D: SELECT guest
        end
        U->>B: compare password/hash
        alt sai
            U-->>C: 401
        else đúng
            U->>J: sign account payload
            U-->>C: 200 token
        end
    end
```

Google branch không gọi Google API và không xác minh ID token.

## 3. Đăng ký và kích hoạt guest

```mermaid
sequenceDiagram
    participant C as Client
    participant U as user.controller
    participant A as AccountModel
    participant D as PostgreSQL
    participant B as bcrypt
    participant J as JWT
    participant N as Nodemailer/Gmail
    C->>U: POST register email/password
    par duplicate checks
        U->>A: findGuest
        A->>D: SELECT guests
        U->>A: findMember
        A->>D: SELECT members
    end
    U->>B: hash cost 10
    U->>J: sign email + passwordHash, 7d
    U->>N: send verification link
    N-->>U: accepted hoặc error
    U-->>C: 201 hoặc 500
    C->>U: POST verify token
    U->>J: verify
    U->>A: duplicate guest check
    A->>D: SELECT guests
    U->>A: insertGuest
    A->>D: INSERT guests
    D-->>U: row
    U-->>C: 200 activated
```

## 4. CRUD nội dung CMS

Áp dụng cho news/events/student life; careers khác ở chỗ controller tự Zod parse và model không set `updated_at`.

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Resource route
    participant V as Zod compiler
    participant K as Controller
    participant M as Resource model
    participant D as PostgreSQL language DB
    C->>R: POST/PUT JSON
    R->>V: validate/transform cover_image
    alt invalid
        V-->>C: Fastify validation error
    else valid
        V->>K: typed body
        K->>M: insert hoặc dynamic update
        M->>D: parameterized SQL RETURNING all
        alt duplicate slug 23505
            D-->>K: PostgreSQL error
            K-->>C: 400 Slug already exists
        else not found on update
            D-->>K: zero rows
            K-->>C: 404
        else success
            D-->>K: row
            K-->>C: 200 message + data
        end
    end
```

Không có auth node vì route hiện không đăng ký auth guard.

## 5. Product create/update

```mermaid
sequenceDiagram
    participant C as Client
    participant R as products.route
    participant P as productsController/model
    participant D as PostgreSQL
    C->>R: POST hoặc PUT product body
    R->>R: Zod validate và strip image origin
    R->>P: create/update
    P->>D: SELECT category id WHERE name exact
    D-->>P: id hoặc empty
    P->>P: generate slug/create; parse price; build specs JSON
    alt create
        P->>D: INSERT products.items RETURNING id
    else update
        P->>D: UPDATE products.items
    end
    P->>D: SELECT item LEFT JOIN category
    D-->>P: row
    P->>P: map DTO và format giá vi-VN
    P-->>C: product object hoặc 404
```

## 6. Upload file và phục vụ ảnh

```mermaid
sequenceDiagram
    participant C as Client
    participant R as POST upload wildcard
    participant M as processUploadPath
    participant F as Filesystem
    participant S as Static plugin
    C->>R: multipart file at /upload/subpath
    R->>M: preHandler
    M->>M: derive rawPath; reject dot-dot; boundary check
    M->>F: mkdir recursive if missing
    M-->>R: request.path.fullPath
    R->>R: request.file; timestamp/random filename
    R->>F: stream file
    F-->>R: write completed
    R-->>C: relative public/static/images URL
    C->>S: GET static URL
    S->>F: read file
    F-->>S: bytes
    S-->>C: file response
```

Handler không kiểm tra MIME và chỉ đọc một file dù plugin limit cho tối đa 10.

## 7. Đăng ký workshop và email received

```mermaid
sequenceDiagram
    participant C as Client
    participant R as workshops route
    participant W as workshopsController
    participant B as BookingModel
    participant D as PostgreSQL
    participant X as DIY/ShortCourse model
    participant N as Gmail
    C->>R: POST registrations body
    R->>R: Zod validation
    R->>W: createRegistration
    W->>B: insert status pending
    B->>D: INSERT booking
    D-->>W: booking row
    alt type diy hoặc short_course
        W->>X: getBySlug(workshop_id)
        X->>D: SELECT workshop
        D-->>W: title nếu có
    end
    W->>N: sendBookingReceivedEmail
    alt mail fails
        N-->>W: error
        W->>W: log, giữ booking
    end
    W-->>C: booking row
```

## 8. Duyệt/hủy booking

```mermaid
sequenceDiagram
    participant O as Operator client
    participant R as PATCH registration status
    participant W as workshopsController
    participant B as BookingModel
    participant D as PostgreSQL
    participant X as Workshop model
    participant N as Gmail
    O->>R: id + pending/approved/cancelled
    R->>R: Zod status validation
    R->>W: updateBookingStatus
    W->>B: updateStatus
    B->>D: UPDATE RETURNING row
    alt zero rows
        W-->>O: unhandled Booking not found error
    else approved/cancelled
        W->>X: lookup title and optional time/location
        X->>D: SELECT by slug
        alt approved
            W->>N: approval email
        else cancelled
            W->>N: cancellation email
        end
        opt mail error
            W->>W: log only
        end
        W-->>O: updated booking
    else pending
        W-->>O: updated booking without email
    end
```

Endpoint operator hiện không có auth/RBAC.

## 9. Báo giá dịch vụ

```mermaid
sequenceDiagram
    participant C as Client
    participant R as services.route
    participant S as servicesController
    participant M as servicesModel
    participant D as PostgreSQL
    participant G as Gmail
    C->>R: POST quote request
    R->>R: Zod validation
    R->>S: input + x-custom-lang
    S->>M: createQuoteRequest
    M->>D: INSERT services.b2b
    D-->>S: inserted row
    par email requester
        S->>G: confirmation email
    and email admin
        S->>G: full details email
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
    participant S as SearchController
    participant M as SearchModel
    participant D as PostgreSQL language DB
    C->>S: GET search?q=text&lang=vi
    alt q missing
        S-->>C: 400
    else q present
        S->>M: globalSearch(q, lang)
        M->>D: UNION ALL with ILIKE across 4 tables, LIMIT 20
        D-->>M: rows ordered by created_at desc
        M-->>S: QueryResult
        S-->>C: 200 status/message/data
    end
```

## 11. Export booking Excel

```mermaid
sequenceDiagram
    participant C as Client
    participant W as workshopsController
    participant B as BookingModel
    participant D as PostgreSQL
    participant E as ExcelJS
    C->>W: GET registrations/export
    W->>B: getAll(lang)
    B->>D: SELECT booking LEFT JOIN DIY
    D-->>W: all rows
    W->>W: sort created_at desc
    W->>E: create workbook, columns, month sections, rows
    E-->>W: XLSX buffer
    W-->>C: binary + content headers
```

Không có streaming/pagination và không có auth.

## 12. CI/CD deployment

```mermaid
sequenceDiagram
    participant G as GitHub main
    participant B as Build job
    participant A as Artifact store
    participant D as Deploy job
    participant F as FTP server
    participant H as Remote unzip webhook
    G->>B: push hoặc manual dispatch
    B->>B: checkout, Node 20, npm ci, npm run build
    B->>B: zip dist/public/package files
    B->>A: upload deploy.zip, retain 1 day
    D->>A: download artifact
    D->>F: upload only deploy.zip
    D->>H: GET unzip.php with key
    H-->>D: response ignored except curl process status
```

## 13. Cronjob và đồng bộ dữ liệu

Không có cron, scheduler runtime, queue, worker hoặc route đồng bộ dữ liệu trong repository. `schedules.model.ts` là CRUD table workshop schedule nhưng không được route/controller sử dụng. `registration.controller.ts` có luồng ghi Google Sheet nhưng không được đăng ký route, nên không phải workflow runtime.

