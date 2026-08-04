# Danh mục API

## 1. Quy ước

- `{API}` là `DEFAULT_API_PREFIX`: `/api` khi `BASE_PATH` rỗng, ngược lại là `<BASE_PATH>/api`.
- Mọi route đều đi qua global `preHandler` gán `request.lang` và global `onSend` rewrite đường dẫn ảnh.
- `Public` trong cột quyền nghĩa là code không kiểm tra token; không đồng nghĩa endpoint an toàn để public trong thiết kế mong muốn.
- `Zod` chỉ được ghi khi route thực sự gắn schema hoặc controller gọi `.parse()`.
- Tổng kiểm kê: 97 endpoint, gồm 4 endpoint root và 93 endpoint thuộc 18 route group.

## 2. Endpoint hệ thống và tiện ích

| Module | Method | Path | Middleware/schema | Handler | Model/service | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Root | GET | `/` | Global hooks | inline | Không | Public | Welcome |
| Root | GET | `/makerspace_server` | Global hooks | inline | Không | Public | Welcome alias |
| Root | GET | `/makerspace_server/ping` | Global hooks | inline | Không | Public | Pong message |
| Root | GET | `/health` | Global hooks | inline | Không | Public | Không kiểm tra DB |
| Utils | GET | `{API}/utils/health` | Global hooks | `utilsController.health` | Không | Public | App health |
| Utils | GET | `{API}/utils/meta` | Global hooks | inline | Không | Public | Tên/version hard-code |

## 3. Users

| Module | Method | Path | Middleware/schema | Handler | Model/service | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Users | POST | `{API}/users/login` | `LoginBody`, `LoginRes` | `loginUser` | `AccountModel`, bcrypt, JWT | Public | Password hoặc nhánh Google whitelist |
| Users | POST | `{API}/users/register` | `RegisterBody` | `registerGuest` | `AccountModel`, bcrypt, mail, JWT | Public | Chưa insert DB; gửi verification |
| Users | POST | `{API}/users/verify` | `{token:string}` | `verifyGuest` | `AccountModel`, JWT | Public, possession of token | Insert guest |
| Users | POST | `{API}/users/checked-valid-session` | Không | inline | `verifySessionToken` | Raw Authorization token | Trả expiry mới tính, không phải `exp` thật |
| Users | GET | `{API}/users/profile` | Không | `getProfile` | `AccountModel`, JWT | Raw Authorization token | Guest trước, member sau |
| Users | PUT | `{API}/users/profile` | Không | `updateProfile` | `AccountModel`, JWT | Raw token; guest only | Body chưa runtime validation |

## 4. Products

| Module | Method | Path | Middleware/schema | Handler | Model/service | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Products | GET | `{API}/products/` | `listProductsQuerySchema` | `listProducts` | `productsModel.list` | Public | Filter category trong memory |
| Products | GET | `{API}/products/categories` | Không | `listCategories` | `products.categories` | Public | Kể cả draft |
| Products | POST | `{API}/products/categories` | `{name,slug?}` | `createCategory` | `addCategory` | Public | Auto-generate slug nếu thiếu |
| Products | PUT | `{API}/products/categories/:id` | id + category body | inline/controller | `updateCategory` | Public | 404 nếu không update row |
| Products | DELETE | `{API}/products/categories/:id` | id schema | inline/controller | `deleteCategory` | Public | Ràng buộc FK để DB quyết định |
| Products | PATCH | `{API}/products/categories/:id/hide` | id + `{draft:boolean}` | inline/controller | `toggleCategoryDraft` | Public | Không có RBAC |
| Products | GET | `{API}/products/:id` | id schema | inline/controller | `findById` | Public | 404 message riêng |
| Products | POST | `{API}/products/` | `createProductSchema` | `createProduct` | `productsModel.create` | Public | Slug thêm hậu tố thời gian |
| Products | PUT | `{API}/products/:id` | id + `updateProductSchema` | inline/controller | `productsModel.update` | Public | Schema update không partial |
| Products | DELETE | `{API}/products/:id` | id schema | inline/controller | `productsModel.delete` | Public | Trả message |
| Products | PATCH | `{API}/products/:id/hide` | id + `{draft:boolean}` | inline/controller | `toggleItemDraft` | Public | Draft toggle |

## 5. Workshop aggregate và booking

| Module | Method | Path | Middleware/schema | Handler | Model/service | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Workshops | GET | `{API}/workshops/` | `listWorkshopsQuerySchema` | `listWorkshops` | in-memory `workshopsModel` | Public | `page/limit` nhận nhưng không dùng |
| Workshops | GET | `{API}/workshops/featured` | Không | `listFeaturedWorkshops` | in-memory model | Public | Filter `featured` |
| Workshops | GET | `{API}/workshops/:id` | id schema | inline | in-memory model | Public | Tìm trong `.data` |
| Booking | POST | `{API}/workshops/registrations` | `createWorkshopRegistrationSchema` | `createRegistration` | booking + DIY/course + mail | Public | Status `pending`; email best-effort |
| Booking | GET | `{API}/workshops/registrations` | Không | `listRegistrations` | booking model | Public | Endpoint quản trị chưa bảo vệ |
| Booking | GET | `{API}/workshops/registrations/me` | Không | inline/controller | account + booking | Raw Authorization token | Lookup email từ account |
| Booking | POST | `{API}/workshops/registrations/find` | Không | inline/controller | `findByContact` | Public | Body không validate |
| Booking | POST | `{API}/workshops/registrations/absence` | Không | inline/controller | `addAbsenceRequest` | Public | Bất kỳ booking id, không ownership check |
| Booking | DELETE | `{API}/workshops/registrations/absence/:booking_id/:index` | Không | inline/controller | `deleteAbsenceRequest` | Public | Index parseInt, không validate |
| Booking | GET | `{API}/workshops/registrations/export` | Không | `exportBookingsExcel` | booking + ExcelJS | Public | Trả file xlsx toàn bộ dữ liệu |
| Booking | PATCH | `{API}/workshops/registrations/:id/status` | `updateBookingStatusSchema` | `updateBookingStatus` | booking + content + mail | Public | pending/approved/cancelled |
| Booking | DELETE | `{API}/workshops/registrations/:id` | Không | `deleteRegistration` | booking model | Public | Throw nếu không thấy |

## 6. DIY và short courses

| Module | Method | Path | Middleware/schema | Controller | Model | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| DIY | GET | `{API}/workshops/diy/` | Không | `getDiyList` | `diyModel.getAll` | Public | Join số người đăng ký |
| DIY | GET | `{API}/workshops/diy/:id` | Không | `getDiyById` | `diyModel.getById` | Public | 404 nếu rỗng |
| DIY | GET | `{API}/workshops/diy/slug/:slug` | Không | `getDiyBySlug` | `diyModel.getBySlug` | Public | Detail theo slug |
| DIY | POST | `{API}/workshops/diy/` | `createDiySchema` | `createDiy` | `diyModel.insert` | Public | DB write |
| DIY | PUT | `{API}/workshops/diy/:id` | `updateDiySchema` | `updateDiy` | `diyModel.update` | Public | Partial update |
| DIY | DELETE | `{API}/workshops/diy/:id` | Không | `deleteDiy` | `diyModel.delete` | Public | Không xóa ảnh |
| Short courses | GET | `{API}/workshops/short_courses/` | Không | `getShortCoursesList` | `shortCoursesModel.getAll` | Public | Created desc |
| Short courses | GET | `{API}/workshops/short_courses/:id` | Không | `getShortCourseById` | `getById` | Public | 404 nếu rỗng |
| Short courses | GET | `{API}/workshops/short_courses/slug/:slug` | Không | `getShortCourseBySlug` | `getBySlug` | Public | Detail theo slug |
| Short courses | POST | `{API}/workshops/short_courses/` | `createShortCourseSchema` | `createShortCourse` | `insert` | Public | 21 cột |
| Short courses | PUT | `{API}/workshops/short_courses/:id` | `updateShortCourseSchema` | `updateShortCourse` | `update` | Public | Dynamic field update |
| Short courses | DELETE | `{API}/workshops/short_courses/:id` | Không | `deleteShortCourse` | `delete` | Public | Không xóa ảnh |

## 7. People

| Module | Method | Path | Middleware/schema | Controller | Model/table | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Staff | GET | `{API}/people/staff/` | Không | `getStaffList` | `people.staff` | Public | Map thêm `image` |
| Staff | GET | `{API}/people/staff/:id` | id string | `getStaffById` | `people.staff` | Public | 404 riêng |
| Staff | POST | `{API}/people/staff/` | `CreateStaffBody` | `createStaff` | `people.staff` | Public | ID do client cung cấp |
| Staff | PUT | `{API}/people/staff/:id` | id + `UpdateStaffBody` | `updateStaff` | `people.staff`, filesystem | Public | Xóa ảnh cũ async |
| Staff | DELETE | `{API}/people/staff/:id` | id string | `deleteStaff` | DB, filesystem | Public | Xóa ảnh best-effort |
| Technicals | GET | `{API}/people/technicals/` | Không | `getTechnicalsList` | `people.technicals` | Public | Map thêm `image` |
| Technicals | GET | `{API}/people/technicals/:id` | id string | `getTechnicalsById` | `people.technicals` | Public | Detail |
| Technicals | POST | `{API}/people/technicals/` | `CreateTechnicalsBody` | `createTechnicals` | table tương ứng | Public | DB write |
| Technicals | PUT | `{API}/people/technicals/:id` | id + update schema | `updateTechnicals` | DB, filesystem | Public | Xóa ảnh cũ async |
| Technicals | DELETE | `{API}/people/technicals/:id` | id string | `deleteTechnicals` | DB, filesystem | Public | Xóa ảnh best-effort |
| Intern | GET | `{API}/people/intern/` | Không | `getInternList` | `people.interns` | Public | Sort display_order |
| Intern | GET | `{API}/people/intern/:id` | Không | `getInternById` | `people.interns` | Public | Không params schema |
| Intern | POST | `{API}/people/intern/` | `CreateInternBody` | `createIntern` | `people.interns` | Public | DB write |
| Intern | PUT | `{API}/people/intern/:id` | `UpdateInternBody` | `updateIntern` | DB, filesystem | Public | Không params schema |
| Intern | DELETE | `{API}/people/intern/:id` | Không | `deleteIntern` | DB, filesystem | Public | Xóa ảnh best-effort |

## 8. CMS posts

### 8.1 News, Events và Student Life

Ba module có cùng sáu operation; bảng ghi rõ schema/model khác nhau.

| Module | Method | Path | Middleware/schema | Controller | Model/table | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| News | GET | `{API}/posts/news/` | Không | `getNewsList` | `posts.news` | Public | publish_date desc |
| News | GET | `{API}/posts/news/slug/:slug` | Không | `getNewsBySlug` | `posts.news` | Public | 404 `Not found` |
| News | GET | `{API}/posts/news/:id` | Không | `getNewsById` | `posts.news` | Public | Detail |
| News | POST | `{API}/posts/news/` | `CreateNewsBody` | `createNews` | `posts.news` | Public | 400 khi slug duplicate |
| News | PUT | `{API}/posts/news/:id` | `UpdateNewsBody` | `updateNews` | `posts.news` | Public | Partial |
| News | DELETE | `{API}/posts/news/:id` | Không | `deleteNews` | `posts.news` | Public | Hard delete |
| Events | GET | `{API}/posts/events/` | Không | `getEventsList` | `posts.events` | Public | publish_date desc |
| Events | GET | `{API}/posts/events/slug/:slug` | Không | `getEventsBySlug` | `posts.events` | Public | Detail |
| Events | GET | `{API}/posts/events/:id` | Không | `getEventsById` | `posts.events` | Public | Detail |
| Events | POST | `{API}/posts/events/` | `CreateEventsBody` | `createEvents` | `posts.events` | Public | Có `event_time` |
| Events | PUT | `{API}/posts/events/:id` | `UpdateEventsBody` | `updateEvents` | `posts.events` | Public | Partial |
| Events | DELETE | `{API}/posts/events/:id` | Không | `deleteEvents` | `posts.events` | Public | Hard delete |
| Student life | GET | `{API}/posts/student_life/` | Không | `getStudentLifeList` | `posts.student_life` | Public | publish_date desc |
| Student life | GET | `{API}/posts/student_life/slug/:slug` | Không | `getStudentLifeBySlug` | table tương ứng | Public | Detail |
| Student life | GET | `{API}/posts/student_life/:id` | Không | `getStudentLifeById` | table tương ứng | Public | Detail |
| Student life | POST | `{API}/posts/student_life/` | `CreateStudentLifeBody` | `createStudentLife` | table tương ứng | Public | DB write |
| Student life | PUT | `{API}/posts/student_life/:id` | `UpdateStudentLifeBody` | `updateStudentLife` | table tương ứng | Public | Partial |
| Student life | DELETE | `{API}/posts/student_life/:id` | Không | `deleteStudentLife` | table tương ứng | Public | Hard delete |

### 8.2 Careers

| Module | Method | Path | Middleware/schema | Controller | Model/table | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Careers | GET | `{API}/posts/careers/` | Không | `getCareersList` | `posts.careers` | Public | publish_date desc |
| Careers | GET | `{API}/posts/careers/slug/:slug` | Không | `getCareersBySlug` | same | Public | Detail |
| Careers | GET | `{API}/posts/careers/:id` | Không | `getCareersById` | same | Public | Detail |
| Careers | POST | `{API}/posts/careers/` | Controller `.parse(CreateCareersSchema)` | `createCareers` | same | Public | Route schema object rỗng |
| Careers | PUT | `{API}/posts/careers/:id` | Controller `.parse(UpdateCareersSchema)` | `updateCareers` | same | Public | 400 Zod/duplicate |
| Careers | DELETE | `{API}/posts/careers/:id` | Không | `deleteCareers` | same | Public | Hard delete |

## 9. Services, contacts, members, upload và search

| Module | Method | Path | Middleware/schema | Handler | Model/integration | Auth/quyền | Ghi chú |
|---|---|---|---|---|---|---|---|
| Services | GET | `{API}/services/catalog` | Không | `listCatalog` | Static array | Public | Nội dung chỉ tiếng Việt mojibake trong source |
| Services | GET | `{API}/services/quote-requests` | Không | `listQuoteRequests` | `services.b2b` | Public | Dùng `x-custom-lang` |
| Services | POST | `{API}/services/quote-requests` | `serviceQuoteRequestSchema` | `createQuoteRequest` | DB + 2 emails | Public | `requestType` không lưu DB |
| Services | DELETE | `{API}/services/quote-requests/:id` | Không | `deleteQuoteRequest` | `services.b2b` | Public | Luôn trả success nếu query không throw |
| Contacts | GET | `{API}/contacts/info` | Không | `getContactDetails` | Static object | Public | Không DB |
| Contacts | GET | `{API}/contacts/inquiries` | Không | `listInquiries` | In-memory array | Public | Mất khi restart |
| Contacts | POST | `{API}/contacts/inquiries` | `contactInquirySchema` | `createInquiry` | In-memory array | Public | Không ID/timestamp |
| Members | GET | `{API}/members/registrations` | Không | `listRegistrations` | In-memory array | Public | Không phải member DB list |
| Members | POST | `{API}/members/registrations` | `memberRegistrationSchema` | `createRegistration` | In-memory array | Public | Mất khi restart |
| Upload | POST | `{API}/upload/*` | `processUploadPath`, multipart | inline | Filesystem | Public | Một file; không MIME allowlist |
| Search | GET | `{API}/search/` | Không | `globalSearch` | SQL search | Public | `q` bắt buộc; `lang` query |

## 10. Code có nghiệp vụ nhưng không có endpoint

| Thành phần | Chức năng | Lý do không nằm trong inventory |
|---|---|---|
| `registration.controller.ts` | Ghi đăng ký workshop vào Google Sheet | Không được import/register bởi route nào |
| `schedules.model.ts` | CRUD `workshops.schedules` | Không có controller/route |
| `user.model.ts` | User lookup và seed admin | Không được controller hiện hành dùng |
| `productsController.getCategoryById` | Placeholder | Body hàm rỗng, không route |

