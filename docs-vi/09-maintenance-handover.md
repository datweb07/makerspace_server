# Bàn giao và bảo trì

## 1. Thứ tự đọc khuyến nghị

1. `src/index.ts`, `src/config.ts`, `src/constants/index.ts` để hiểu bootstrap/base path.
2. `src/models/db/pool.ts`, `src/type.d.ts` để hiểu song ngữ/database.
3. Route tương ứng, rồi controller, schema và model theo module.
4. `src/utils/jwt.ts`, `mail.ts`, upload middleware cho side effects/security.
5. `package.json`, `tsconfig.json`, `nodemon.json` cho local workflow.
6. `.github/workflows/deploy-makerspace.yml` cho release.
7. Bộ tài liệu này; dùng `03` làm inventory và `04` làm contract baseline.

## 2. File cốt lõi cần kiểm tra trước khi sửa

| Loại thay đổi | File tối thiểu |
|---|---|
| Prefix/CORS/plugin/static | `src/index.ts`, `src/config.ts`, constants |
| Ngôn ngữ/DB | global hook, `pool.ts`, mọi nơi tự đọc lang/header |
| Auth | user route/controller, `jwt.ts`, AccountModel, hai auth placeholder |
| CMS CRUD | route + controller + schema + model cùng module |
| Booking | workshops route/controller, booking model, DIY/course model, `mail.ts` |
| Product | products route/controller/model/schema |
| Upload/ảnh | upload route, processUploadPath, onSend hook, image transforms, people controllers |
| Deploy | package scripts, workflow, `.env` contract, public persistence |

## 3. Quy trình thêm/thay đổi tính năng

### 3.1 Trước khi code

- Xác định endpoint public hay protected và role/ownership.
- Xác định DB VI/EN, migration cho cả hai và rollback.
- Viết request/response/error contract; quyết định `lang` duy nhất.
- Liệt kê side effect email/file/external API và semantics khi lỗi.

### 3.2 Khi triển khai

1. Tạo/update Zod schema; tránh chỉ ép type TypeScript.
2. Route chỉ khai báo transport, schema và auth guard.
3. Đưa business orchestration vào service khi có nhiều model/side effect.
4. Model dùng parameterized SQL; whitelist tên cột nếu dynamic update.
5. Chuẩn hóa exception domain và response.
6. Thêm tests unit/route/integration cho VI và EN.
7. Cập nhật đồng thời `03-api-inventory.md`, `04-api-reference.md`, sơ đồ nghiệp vụ và bản EN.

### 3.3 Gate trước merge

```text
npm ci
npx tsc --noEmit
npm run lint
npm run build
<test command sau khi bổ sung test suite>
```

Hiện lint chưa pass; cần tạo baseline/fix riêng, không âm thầm bỏ gate.

## 4. Rủi ro đã biết

| Mức | Rủi ro code thực tế | Tác động |
|---|---|---|
| Critical | Write/admin/export/upload endpoints không auth/RBAC | Sửa/xóa dữ liệu, lộ PII, upload tùy ý |
| Critical | Google login không verify Google token | Mạo danh member qua email |
| Critical | Secret fallback hard-code | Compromise DB/JWT nếu được dùng |
| High | Pool max 500 mỗi lang key/process | Exhaust PostgreSQL |
| High | `lang` không validate và làm pool cache theo raw string | Tạo nhiều pool keys/DoS resource |
| High | Upload không MIME allowlist và static serve cùng root | Lưu/serve file nguy hiểm, disk exhaustion |
| High | Local upload + in-memory stores | Mất/khác dữ liệu khi restart/scale |
| High | Booking admin và quote PII public | Privacy incident |
| High | Verification token chứa password hash trong URL | Leak qua browser/history/log/referrer |
| Medium | Không global error contract | Client khó ổn định, lộ raw error |
| Medium | Email/file không transaction/retry | DB và side effect lệch trạng thái |
| Medium | Dynamic update từ object keys | Phụ thuộc chặt validation; rủi ro khi reuse model |
| Medium | Không migrations/tests/OpenAPI | Regression và drift schema |
| Medium | README lệch code | Vận hành/client tích hợp sai |
| Medium | Source string có mojibake | Email/API/text hiển thị lỗi |
| Medium | CI không lint/test/smoke/rollback | Lỗi lọt production |

## 5. Các lệch giữa README và code cần không được kế thừa

- README nói ngôn ngữ qua `x-custom-lang`; code global dùng `query.lang`, chỉ services dùng header.
- README nói members trả danh sách member DB; code route `/members/registrations` dùng mảng in-memory.
- README mô tả PATCH hide cho DIY/short courses/posts; route thực tế không có các PATCH đó, ngoài products/categories.
- README nói pagination products/workshops; code không paginate.
- README gọi nhiều endpoint là admin, nhưng không có guard.
- README nói verification token short-lived; code là 7 ngày giống session.
- README đề cập Google Sheets cho export; export hiện dùng ExcelJS, Google Sheets controller không routed.

## 6. Backlog cải tiến đề xuất

### Giai đoạn 0: ngăn sự cố

- Đóng write/admin/export/upload routes sau auth/RBAC.
- Vá Google login, rotate secrets, giảm pool max, validate lang enum.
- Thêm file type/size/name policy, rate limit và PII access control.

### Giai đoạn 1: tạo nền tảng ổn định

- Global error handler và structured logging/redaction.
- Migration framework, `.env.example`, startup env validation.
- Test route/auth/database contracts; CI lint/test/build.
- Chuẩn hóa locale input và API response envelope.

### Giai đoạn 2: tách trách nhiệm

- Service layer cho booking/account/quote.
- Outbox hoặc job queue cho email.
- Object storage cho media; metadata DB và cleanup an toàn.
- Refresh/revocation/session strategy và audit log.
- OpenAPI sinh từ Zod hoặc contract source duy nhất.

## 7. Checklist xử lý sự cố

### API 5xx

1. Xác định route/lang/request ID từ log.
2. Kiểm tra DB pool timeout/connection limit và schema VI/EN tương ứng.
3. Phân biệt lỗi core transaction với lỗi email/file best-effort.
4. Kiểm tra `BASE_PATH` nếu 404/static URL.
5. Không log Authorization, password, verification token hoặc DB secret.

### Upload/static lỗi

1. Kiểm tra working directory, `MEDIA_UPLOAD_FOLDER`, quyền ghi và disk.
2. Kiểm tra URL rewrite bằng `SERVER_PROTOCOL`, `SERVER_DOMAIN`, `BASE_PATH`.
3. Kiểm tra path lưu trong DB có/không leading slash.
4. Backup trước khi chỉnh/xóa file; controller people có thể xóa ảnh cũ.

### Login/mail lỗi

1. Xác nhận đúng database theo `?lang=`.
2. Kiểm tra account nằm ở members hay guests và password hash.
3. Kiểm tra JWT secret nhất quán giữa instances.
4. Kiểm tra Gmail app credential/quota; không resend token trong log.

## 8. Definition of done cho bàn giao

- Owner code, DB, domain, Gmail, FTP/cPanel và webhook được chỉ định.
- DDL/migration và backup runbook được cung cấp.
- Secret được rotate và đưa vào secret manager.
- Permission matrix được phê duyệt và triển khai.
- Lint/test/build/health gate xanh.
- Deploy/rollback staging được diễn tập.
- 18 tài liệu được giữ đồng bộ khi contract thay đổi.

