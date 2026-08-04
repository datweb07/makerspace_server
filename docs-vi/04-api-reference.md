# Tham chiếu API chi tiết

## 1. Base URL, headers và format

Base path là `/api` hoặc `<BASE_PATH>/api`. Các ví dụ dùng `/api`.

| Input | Cách dùng thực tế |
|---|---|
| `lang` query | Global hook gán `request.lang`; `en` chọn DB EN, mặc định `vi` |
| `x-custom-lang` header | Chỉ route quote request của services dùng |
| `Authorization` header | Raw JWT, không dùng `Bearer `, chỉ bốn route kiểm tra |
| `Content-Type: application/json` | Các request body JSON |
| `multipart/form-data` | Upload, field file đầu tiên do `request.file()` đọc |

> Các model dùng `SELECT *`, repository không có DDL. Vì vậy tài liệu chỉ nêu field response chắc chắn từ code; các cột DB bổ sung được trả nguyên trạng nhưng không được suy đoán.

## 2. System và utils

### `GET /`, `GET /makerspace_server`

Không có input/auth. Cả hai trả `200`:

```json
{"ok":true,"message":"Welcome to MakerSpace API Server"}
```

### `GET /makerspace_server/ping`

Trả `{"ok":true,"message":"pong - v2 with trailing slash fix"}`.

### `GET /health`, `GET /api/utils/health`

Trả `{"ok":true,"service":"makerspace_server"}`. Không ping database, SMTP hay filesystem.

### `GET /api/utils/meta`

Trả `{"name":"makerspace_server","version":"1.0.0"}`; version hard-code.

## 3. Authentication và profile

### `POST /api/users/login`

Mục đích: phát JWT session 7 ngày.

Body:

```json
{"username":"user@example.com","password":"secret","auth_provider":"password"}
```

- `username`: string tối thiểu 3 ký tự.
- `password`: optional ở schema, nhưng bắt buộc nếu `auth_provider !== "google"`.
- Nếu `auth_provider === "google"`, controller chỉ lookup `accounts.members.username`; password bị bỏ qua và không có Google token verification.
- Password flow lookup member trước, guest sau, rồi `bcrypt.compare`.
- Token payload: `userId`, `username`, `role`; role fallback `member` ở Google branch, `guest` ở password branch.

Success `200`:

```json
{"message":"Đăng nhập thành công","data":{"token":"<jwt>","expires":"<ISO timestamp now+7d>"}}
```

Errors: `400` thiếu password; `401` sai password; `404` account/email không tồn tại; `500` exception.

### `POST /api/users/register`

Body: `username` phải là email; `password` optional ở schema nhưng controller yêu cầu; `auth_provider` được nhận nhưng không dùng.

Luồng: lookup guest và member song song; `409` nếu trùng; bcrypt hash cost 10; ký token 7 ngày chứa cả `username` và `passwordHash`; gửi link `${CORS_ORIGIN}/vi/login?verify=<token>`. Không insert DB ở bước này.

Success `201`: `{"message":"Vui lòng kiểm tra email để kích hoạt tài khoản"}`. Error `400`, `409`, `500`.

### `POST /api/users/verify`

Body: `{"token":"<verification-jwt>"}`. Verify cùng `SESSION_TOKEN_SECRET`, yêu cầu payload có `username`, `passwordHash`; kiểm tra guest chưa tồn tại; insert `accounts.guests` với role `guest`, provider `password`.

Success `200` có `message`. `400` nếu token thiếu/shape không hợp lệ; `409` đã kích hoạt. Token hết hạn/chữ ký sai hiện bị catch chung và trả `500`, không phải `400/401`.

### `POST /api/users/checked-valid-session`

Header `Authorization: <raw-jwt>`. Success:

```json
{"message":"Session is valid","token":"<same-token>","expires":"<now+7d>"}
```

`expires` được tính lại từ thời điểm request, không đọc claim `exp`. Thiếu/sai token trả `401`.

### `GET /api/users/profile`

Verify raw token, lookup guest rồi member theo `decoded.username`, loại field `password`, trả `200 {"data":{...profile}}`. Thiếu token `401`, không có account `404`; verify error hiện trả `500`.

### `PUT /api/users/profile`

Body kỳ vọng `{"fullname":"...","phone":"..."}` nhưng không có Zod runtime validation. Chỉ update `accounts.guests`; member nhận `403`. Success `200 {"message":"Profile updated successfully"}`.

## 4. Products và categories

### Product response DTO

Model map DB row thành:

```json
{
  "id": 1,
  "name": "...",
  "category": "<category name hoặc Khác>",
  "material": "<specs.material hoặc rỗng>",
  "price": "<locale vi-VN>đ hoặc Liên hệ",
  "description": "<content>",
  "image": "<cover_image>",
  "images": [],
  "draft": false
}
```

### `GET /api/products?category=<exact-name>&lang=en`

Đọc toàn bộ item join category, sort `created_at DESC`; sau đó lọc equality theo tên category trong process. Trả `{"data":[...],"total":n}`. Không dùng pagination, không lọc draft.

### `GET /api/products/:id`

`id` là string không rỗng rồi ép `Number`. Trả DTO trực tiếp, không bọc `data`. Không thấy trả `404 {"message":"Product not found"}`.

### `POST /api/products`

Body bắt buộc: `name`, `category`, `material`, `price`, `description`, `image`; optional `images`, `slug`. Image URL tuyệt đối bị schema bỏ origin.

Logic: tìm category bằng exact name; không thấy thì `category_id=null`; tạo slug nếu thiếu rồi luôn nối `-<4 chữ số cuối Date.now()>`; parse giá bằng cách bỏ ký tự ngoài digit/dot; insert `specs` JSON. Trả Product DTO trực tiếp.

### `PUT /api/products/:id`

Body giống hệt create, không phải partial. Update category/name/image/content/price/specs, rồi gọi findById. Nếu không thấy trả 404; nếu có trả DTO.

### `DELETE /api/products/:id`, `PATCH /api/products/:id/hide`

- DELETE hard-delete; success `{"message":"Product deleted successfully"}`.
- PATCH body `{"draft":true}`; update draft; success `{"message":"Product visibility updated successfully"}`.
- Cả hai trả 404 message `Product not found` nếu không có row.

### Categories

| Endpoint | Input | Logic và success |
|---|---|---|
| `GET /api/products/categories` | `lang` query | `SELECT id,name,slug,draft`, trả `{"data":[...]}` |
| `POST /api/products/categories` | `{name:string,slug?:string}` | Sinh slug từ name nếu thiếu; insert; trả `{"data":"<returned name>"}` |
| `PUT /api/products/categories/:id` | body như create | Update name/slug; trả `{"message":"Category updated successfully"}` |
| `DELETE /api/products/categories/:id` | id | Hard-delete, message success |
| `PATCH /api/products/categories/:id/hide` | `{draft:boolean}` | Toggle draft, message success |

Ba endpoint theo id trả `404 {"message":"Category not found"}` khi model trả false. Lỗi unique/FK không được map riêng.

## 5. Workshop landing data

### `GET /api/workshops`

Query schema nhận `limit`, `page` dạng number coerce và `tag` string. Chỉ `tag` được dùng, so sánh exact. Dữ liệu là sáu object hard-code trong `workshops.model.ts`; trả `{"data":[...],"total":n}`.

### `GET /api/workshops/featured`

Lọc mảng tĩnh với `featured === true`, trả `{"data":[...]}`.

### `GET /api/workshops/:id`

Ép id sang number, tìm trong dữ liệu tĩnh. Trả object workshop trực tiếp; không thấy trả `404 {"message":"Workshop not found"}`.

## 6. Workshop booking

### `POST /api/workshops/registrations`

Body:

```json
{
  "workshop_id":"slug",
  "workshop_type":"diy",
  "name":"Nguyen Van A",
  "phone":"0900000000",
  "email":"a@example.com",
  "participants":1,
  "note":"optional"
}
```

`workshop_type` chỉ được validate là string không rỗng, dù controller chỉ enrich tên cho `diy`/`short_course`. Insert status `pending`; sau đó lookup title theo slug và gửi email received. Lỗi email không làm request lỗi. Trả booking row trực tiếp.

### `GET /api/workshops/registrations`

Trả `{"data":[...]}` từ booking join chỉ với `workshops.diy`; short course có thể không có `workshop_title`. Public trong code.

### `GET /api/workshops/registrations/me`

Raw JWT bắt buộc. Lookup guest/member, xác định `email = account.email || account.username`, rồi query booking theo email, join DIY/course. Trả `{"data":[...]}`. Errors: 401 thiếu/sai token, 404 account/email không có.

### `POST /api/workshops/registrations/find`

Body chưa validate: `email`, `phone`, `workshop_id`, `workshop_type`. Query equality cả bốn field. Success `{"data":<row>}`; không thấy trả 404.

### Absence requests

- `POST /api/workshops/registrations/absence`: body `booking_id`, `date`, `reason`; append object kèm `submitted_at` ISO vào JSONB; trả `{"data":<row>,"message":"Absence request submitted successfully"}`.
- `DELETE /api/workshops/registrations/absence/:booking_id/:index`: JSONB array trừ index; trả row/message.
- Không auth, ownership check, schema hoặc 404 handling.

### `GET /api/workshops/registrations/export`

Đọc toàn bộ booking, sort giảm dần theo `created_at`, tạo worksheet `Workshop Bookings`, thêm dòng phân nhóm `MM/YYYY`, trả binary với content type XLSX và filename `workshop_bookings.xlsx`.

### `PATCH /api/workshops/registrations/:id/status`

Body `status` chỉ nhận `pending|approved|cancelled`. Update row; nếu approved/cancelled, lookup workshop và gửi mail tương ứng. DIY lấy title/location/start time; short course chỉ lấy title. Email lỗi không rollback. Không thấy booking làm controller throw `Error("Booking not found")`, để Fastify map mặc định.

### `DELETE /api/workshops/registrations/:id`

Hard-delete; success `{"message":"Deleted successfully"}`; không thấy cũng throw và dùng Fastify error mặc định.

## 7. DIY CRUD

Schema create: `title`, `slug` bắt buộc; optional `cover_image`, `content`, `difficulty`, `draft`, `start_time`, `end_time`, `location`, `max_participants`. Update là partial.

| Endpoint | Logic | Success/error |
|---|---|---|
| `GET /api/workshops/diy` | Join booking không cancelled, `SUM(participants)` | `{data:[rows]}` / 500 |
| `GET /api/workshops/diy/:id` | Cùng aggregate theo id | `{data:row}` / 404 / 500 |
| `GET /api/workshops/diy/slug/:slug` | Cùng aggregate theo slug | `{data:row}` / 404 / 500 |
| `POST /api/workshops/diy` | Insert 10 field | `{message:"Created successfully",data:row}`; duplicate slug 400 |
| `PUT /api/workshops/diy/:id` | Dynamic partial update, thêm `updated_at` | success; 404; duplicate 400 |
| `DELETE /api/workshops/diy/:id` | Hard-delete | message; 404; 500 |

Cover image schema chuẩn hóa absolute URL có suffix `public/static/images/...` thành relative path.

## 8. Short course CRUD

Create nhận: `title`, `slug`; optional `cover_image`, `content`, `duration`, `price` nonnegative, `location`, `language`, `level`, `experience_requirements`, `objectives`, `structure:any`, `offer_by:any`, `summarize:any`, `draft`, `start_time`, `end_time`, `schedule_details`, `max_participants`, `type`, `status`. Update partial.

Sáu endpoint list, by-id, by-slug, create, update, delete có path và envelope tương ứng DIY. List chỉ `SELECT * ORDER BY created_at DESC`, không aggregate booking. Duplicate slug create/update trả 400; not found 404; exception 500.

## 9. CMS post CRUD

### Shared News/Student Life body

`title`, `slug`, `cover_image`, `content`, `author`, `publish_date` bắt buộc; `description` nullable/optional; `draft` default false. Update partial. Image transform giữ phần `public/static/images/...` khi input là absolute URL.

### Events body

Giống shared body, thêm optional/nullable `event_time`.

### Careers body

`title`, `slug`, `deadline` bắt buộc; `status` enum `open|closed` default open; optional `content`, `publish_date` coerce Date, `draft`. Careers controller tự parse.

### Endpoint matrix

Với `{resource}` là `news`, `student_life`, `events` hoặc `careers`:

| Method/path | Hành vi |
|---|---|
| `GET /api/posts/{resource}` | `SELECT *`, order `publish_date DESC`, trả `{data:[rows]}` |
| `GET /api/posts/{resource}/slug/:slug` | Trả `{data:row}` hoặc 404 `Not found` |
| `GET /api/posts/{resource}/:id` | Trả `{data:row}` hoặc 404 |
| `POST /api/posts/{resource}` | Insert và trả `{message:"Created successfully",data:row}` |
| `PUT /api/posts/{resource}/:id` | Dynamic partial update; careers không tự set `updated_at`, ba module kia có |
| `DELETE /api/posts/{resource}/:id` | Hard-delete, trả message; 404 nếu không thấy |

Create/update news/events/student life map PostgreSQL `23505` thành `400 Slug already exists`; careers làm tương tự và còn map Zod error thành 400 có `errors`.

## 10. People CRUD

### Request bodies

- Staff/technicals create: `id`, `name`, `cover_image` bắt buộc; optional `title`, `bio`, email nullable/rỗng, `display_order` integer default 0, `draft` default false.
- Intern create: tương tự nhưng không có email.
- Update bỏ `id` và mọi field optional.
- Image transform chấp nhận URL tuyệt đối, strip host; staff/technicals còn strip optional `makerspace_server/`.

### Endpoint behavior

Mỗi prefix `/api/people/staff`, `/technicals`, `/intern` có `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

- List order `display_order ASC, id DESC`, trả `{data:[...]}` và alias `image=cover_image`.
- Create trả `{message:"Created successfully",data:row}`.
- Update đọc old row, update dynamic fields, rồi nếu ảnh đổi thì `fs.unlink` ảnh cũ bất đồng bộ.
- Delete `RETURNING *`, rồi xóa file ảnh best-effort.
- Not found message là `Staff not found`, `Technicals not found` hoặc `Intern not found`; exception 500.

## 11. Services

### `GET /api/services/catalog`

Trả `{data:[...]}` từ mảng tĩnh gồm ba item, mỗi item có `model,title,description,features,cta,ctaPath,bg,fg`.

### `POST /api/services/quote-requests`

Body: `fullName`, email hợp lệ, phone tối thiểu 6, `description`; optional `companyName`, `requestType[]`. Insert chỉ năm field trừ `requestType`; sau đó gửi confirmation và admin email song song. Trả row DB trực tiếp. Mail failure chỉ log.

### `GET /api/services/quote-requests`

Chọn DB bằng `x-custom-lang`, trả `{data:[rows]}` order `created_at DESC`.

### `DELETE /api/services/quote-requests/:id`

Controller gọi delete mà không truyền lang, nên luôn dùng DB VI mặc định dù header là `en`. Luôn trả `200 {"message":"Deleted successfully"}` nếu query không throw, kể cả không có row.

## 12. Contacts và members in-memory

### Contacts

- `GET /api/contacts/info`: trả object static address/hotline/email/workHours trực tiếp.
- `GET /api/contacts/inquiries`: trả `{data:[...]}`.
- `POST /api/contacts/inquiries`: body gồm `companyName`, `contactName`, email, phone min 6, optional `requestKinds[]`, `detail`; push vào mảng và trả chính input.

### Members

- `GET /api/members/registrations`: `{data:[...]}`.
- `POST /api/members/registrations`: body `type` trong `student|workshop|booking`, `fullName`, phone, email; các field còn lại optional. Push và trả input.

Hai store đều reset khi restart.

## 13. Upload

### `POST /api/upload/*`

Wildcard định nghĩa subdirectory. Middleware resolve dưới `<cwd>/<MEDIA_UPLOAD_FOLDER>/images`, chặn chuỗi `..`, tạo directory. Handler lấy một file, giữ extension client hoặc `.jpg`, tạo `<timestamp>_<0..9999><ext>`, stream ra disk.

Success:

```json
{"url":"public/static/images/<subpath>/<generated-file>"}
```

Không file: `400` với message tiếng Việt trong source. Exception: `500 {"message":"Upload failed"}`. Không có MIME allowlist, scan, auth hoặc cleanup rollback.

## 14. Search

### `GET /api/search?q=<text>&lang=vi`

`q` bắt buộc; thiếu trả:

```json
{"status":400,"message":"Query parameter 'q' is required"}
```

SQL dùng `%q%`, `ILIKE` title/description, union news/events/student_life/short_courses, order `created_at DESC`, limit 20. Success:

```json
{"status":200,"message":"Search completed successfully","data":[{"id":"...","title":"...","slug":"...","cover_image":"...","description":"...","type":"news","created_at":"..."}]}
```

Exception trả `500` kèm `error.message`, có thể lộ chi tiết nội bộ.

## 15. Validation error do Fastify

Với route gắn Zod schema, validation xảy ra trước controller. Do không có custom error handler, payload/status cụ thể phụ thuộc Fastify và compiler version; client không nên giả định giống `{message}` do controller tự trả. Đây là lý do cần chuẩn hóa contract trước khi phát hành API version mới.

