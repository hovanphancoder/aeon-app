Bạn là Senior Full-stack Developer + UI/UX Developer + System Architect.

Hãy xây dựng một hệ thống booking/activation cho chương trình AEON Hải Dương dựa trên file brief/design tôi cung cấp.

MỤC TIÊU:
Xây dựng một hệ thống production-ready gồm 2 frontend/source code độc lập, sử dụng 2 domain khác nhau nhưng dùng chung một Backend API và Database.

========================================

1. KIẾN TRÚC HỆ THỐNG
   ========================================

Tạo kiến trúc:

[Customer Frontend]
https://booking.DOMAIN.com
|
| REST API
v
[Backend API]
https://api.DOMAIN.com
|
+---- Database
|
+---- File/Image Storage
|
+---- Zalo ZNS OTP

[Admin Frontend]
https://admin.DOMAIN.com
|
| REST API
v
[Backend API]

Customer Frontend và Admin Frontend phải là 2 source code độc lập.

Không được để frontend customer truy cập trực tiếp database.

Không được xử lý logic duyệt bill ở frontend.

Tất cả business logic phải nằm ở Backend API.

========================================
2. CÔNG NGHỆ
============

Ưu tiên sử dụng:

Customer:

* React
* Vite
* Tailwind CSS
* Responsive Mobile-first

Admin:

* React
* Vite
* Tailwind CSS
* Responsive Desktop-first nhưng vẫn responsive mobile

Backend:

* Node.js
* NestJS hoặc Express.js
* REST API
* JWT Authentication

Database:

* MySQL

File storage:

* Có abstraction để có thể dùng Local Storage hoặc S3-compatible storage.
* Không lưu ảnh bill trực tiếp vào database.
* Database chỉ lưu URL/path của file.

Authentication:

* Customer đăng nhập bằng số điện thoại + OTP.
* Admin đăng nhập bằng username/email + password.
* JWT access token.
* Customer session có thời hạn 1 ngày theo brief.

========================================
3. CUSTOMER FRONTEND
====================

Domain:

booking.DOMAIN.com

Giao diện phải mobile-first.

Các màn hình chính:

SCREEN 1:
TRANG BÌA / ĐĂNG KÝ THÔNG TIN

Hiển thị:

* Logo AEON
* Background/banner theo thiết kế
* Nội dung chương trình
* Form:

  * Họ tên
  * Số điện thoại
* Button tiếp tục

Khi submit:

* Validate số điện thoại
* Gửi OTP
* Chuyển sang Screen 2.

SCREEN 2:
NHẬP OTP

Hiển thị:

* Số điện thoại đã đăng ký
* 4/6 digit OTP tùy cấu hình backend
* Countdown resend OTP
* Button xác nhận OTP
* Button gửi lại OTP

OTP phải được gửi thông qua Zalo ZNS.

Không hard-code OTP trong frontend.

========================================
4. ĐĂNG NHẬP / REMEMBER SESSION
===============================

Sau khi OTP hợp lệ:

* Backend tạo customer session/JWT.
* Session được nhớ trong 1 ngày.

Theo brief:

"Mỗi tài khoản đã đăng nhập sẽ được nhớ trong vòng 1 ngày.
Ví dụ khi đăng nhập buổi sáng rồi thì mấy lần sau quét mã là được đăng nhập luôn không cần gửi lại OTP."

Do đó:

* Lưu session/token an toàn.
* Token hết hạn sau 24 giờ.
* Nếu token còn hiệu lực thì không yêu cầu OTP lại.
* Backend phải kiểm tra session.
* Không chỉ dựa vào localStorage để xác thực.

========================================
5. CHỌN THÁNG
=============

SCREEN 3:

Hiển thị:

* Logo AEON
* THÁNG 10
* THÁNG 11
* THÁNG 12
* Thể lệ

Tháng phải được quản lý từ Admin.

Không hard-code trạng thái tháng trong frontend.

Admin có thể:

* Active
* Inactive
* Coming Soon

Ví dụ:

October:
ACTIVE

November:
COMING SOON

December:
COMING SOON

Nếu chọn tháng Coming Soon:
Hiển thị Screen Coming Soon.

========================================
6. CHỌN HOẠT ĐỘNG
=================

Nếu khách chọn tháng đang active:

Hiển thị danh sách Activity.

Ví dụ tháng 10:

Activity 1:
NAIL XINH TẶNG NÀNG

Activity 2:
NÉT ĐIỆU CHO NÀNG

Mỗi activity có:

* Tên
* Logo
* Banner
* Mô tả
* Thể lệ
* Trạng thái
* Thời gian bắt đầu
* Thời gian kết thúc

Activity phải được quản lý bằng Admin.

========================================
7. UPLOAD BILL
==============

Khi khách chọn Activity:

Hiển thị:

"Vui lòng up ảnh hóa đơn của bạn"

Có:

* Camera
* Upload ảnh từ điện thoại
* Preview ảnh
* Button submit

Ưu tiên UX mobile:

<input type="file" accept="image/*" capture="environment">

Cho phép:

* Chụp ảnh trực tiếp
* Chọn ảnh từ máy

Backend phải:

* Validate MIME type
* Validate file size
* Validate extension
* Rename file bằng UUID
* Không dùng filename của user làm filename thực tế
* Lưu ảnh vào storage
* Database lưu URL/path

Không cho phép upload PHP/script hoặc file nguy hiểm.

========================================
8. BILL SUBMISSION
==================

Khi submit bill:

Tạo record:

bill_submission

Bao gồm:

id
customer_id
activity_id
month_id
phone
customer_name
bill_image
status
admin_note
submitted_at
reviewed_at
reviewed_by

Status:

pending
approved
rejected

Sau khi submit thành công:

Hiển thị:

"VUI LÒNG CHỜ TRONG GIÂY LÁT"

Không cho frontend tự quyết định bill hợp lệ.

========================================
9. ADMIN DUYỆT BILL
===================

Admin Frontend:

https://admin.DOMAIN.com

Có login.

Dashboard hiển thị:

STT
THỜI GIAN
SDT
TÊN
THÁNG
HOẠT ĐỘNG
HÌNH BILL
PHÊ DUYỆT

Theo brief admin có 2 nút:

CHẤP NHẬN
TỪ CHỐI

Admin click vào bill:

* Xem ảnh bill lớn
* Xem thông tin customer
* Xem tháng
* Xem activity
* Xem thời gian gửi
* Nhập ghi chú nếu cần

Có button:

[CHẤP NHẬN]
[TỪ CHỐI]

========================================
10. LOGIC APPROVAL
==================

Khi Admin CHẤP NHẬN:

Backend:
status = approved

Customer frontend khi kiểm tra trạng thái:

Hiển thị:

CHÚC MỪNG

Bạn có 1 lượt tham gia workshop

và nội dung tương ứng với activity.

Ví dụ:

NAIL XINH TẶNG NÀNG

Bạn có 1 lượt tham gia workshop nhận ngay nail box.

========================================
11. KHI BILL BỊ TỪ CHỐI
=======================

Nếu status = rejected:

Hiển thị:

"Hóa đơn Quý khách chưa hợp lệ.

Vui lòng xem lại thể lệ hoặc liên hệ với PG để được hỗ trợ"

Có nút:

[THỂ LỆ]

========================================
12. QUY TẮC THAM GIA
====================

Theo brief:

"Mỗi khách hàng được tham gia nhiều lần và tham gia được nhiều hoạt động miễn là bill hợp lệ được xác nhận."

Do đó:

KHÔNG giới hạn:

* 1 customer chỉ được 1 bill
* 1 phone chỉ được 1 activity

Một customer có thể:

Bill 1 → Activity A → Approved
Bill 2 → Activity B → Approved
Bill 3 → Activity A → Approved

Tuy nhiên cần tạo cơ chế chống spam / abuse.

Backend phải kiểm tra:

* Authentication
* Rate limit
* Upload frequency
* Duplicate submission nếu cần
* Có thể cấu hình rule chống submit cùng một bill nhiều lần.

========================================
13. DATABASE
============

Thiết kế database chuẩn hóa.

Các bảng tối thiểu:

customers

id
name
phone
created_at
updated_at

customer_sessions

id
customer_id
token_hash
expires_at
created_at

otp_requests

id
phone
otp_hash
expires_at
verified_at
attempts
created_at

months

id
name
slug
status
start_date
end_date
created_at
updated_at

activities

id
month_id
name
slug
logo
banner
description
rules
status
start_date
end_date
created_at
updated_at

bill_submissions

id
customer_id
month_id
activity_id
bill_image
status
admin_note
submitted_at
reviewed_at
reviewed_by

admins

id
name
email
password_hash
role
status
created_at

admin_logs

id
admin_id
action
target_type
target_id
metadata
created_at

========================================
14. API
=======

Thiết kế REST API rõ ràng.

Customer API:

POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/logout
GET /api/auth/me

GET /api/months
GET /api/months/:id
GET /api/activities
GET /api/activities/:id

POST /api/bills
GET /api/bills
GET /api/bills/:id

Admin API:

POST /api/admin/auth/login
POST /api/admin/auth/logout
GET /api/admin/me

GET /api/admin/dashboard

GET /api/admin/bills
GET /api/admin/bills/:id

POST /api/admin/bills/:id/approve
POST /api/admin/bills/:id/reject

CRUD:

/api/admin/months
/api/admin/activities
/api/admin/customers

========================================
15. ADMIN DASHBOARD
===================

Dashboard cần có:

* Tổng khách hàng
* Tổng bill
* Bill chờ duyệt
* Bill đã duyệt
* Bill bị từ chối
* Thống kê theo tháng
* Thống kê theo activity

Có:

* Search số điện thoại
* Search tên
* Filter tháng
* Filter activity
* Filter status
* Filter date
* Pagination

Bảng bill:

STT
Thời gian
SĐT
Tên
Tháng
Hoạt động
Ảnh bill
Trạng thái
Action

Action:

* Xem
* Approve
* Reject

========================================
16. UI/UX
=========

Tôi sẽ cung cấp file brief/design.

Hãy phân tích file trước khi code.

Không tự ý thay đổi flow.

Giữ đúng:

* Layout
* Typography
* Spacing
* Button
* Border radius
* Animation
* Logo
* Background
* Nội dung
* Mobile layout

Mục tiêu là giao diện frontend customer phải bám sát thiết kế được cung cấp.

Nếu trong design có hình ảnh placeholder:
Tạo component để dễ dàng thay asset sau này.

========================================
17. THỂ LỆ
==========

Tất cả screen có button:

"THỂ LỆ"

Click sẽ mở trang/modal thể lệ.

Nội dung thể lệ phải quản lý được từ Admin.

Không hard-code nội dung vào React component.

========================================
18. SECURITY
============

Bắt buộc:

* Password hash bằng bcrypt/argon2
* JWT
* HTTP-only cookie nếu phù hợp
* CORS whitelist:
  booking.DOMAIN.com
  admin.DOMAIN.com
* Rate limit OTP
* Rate limit login
* Rate limit upload
* Validate input bằng backend
* SQL injection protection
* XSS protection
* CSRF protection nếu dùng cookie authentication
* File upload security
* MIME validation
* File size limit
* Audit log admin
* Không expose secret key frontend
* Không expose database credentials frontend
* Không expose ZNS credentials frontend

========================================
19. ZALO ZNS OTP
================

Tạo service:

ZaloZNSService

Có interface:

sendOTP(phone, otp)

Không hard-code credentials.

Dùng environment variables:

ZALO_APP_ID=
ZALO_SECRET_KEY=
ZALO_TEMPLATE_ID=
ZALO_ACCESS_TOKEN=

Nếu chưa có ZNS credentials:

Tạo mock provider để development.

Ví dụ:

MockZNSProvider
ZaloZNSProvider

Có thể switch bằng:

ZNS_PROVIDER=mock
hoặc
ZNS_PROVIDER=zalo

========================================
20. ENVIRONMENT
===============

Tạo:

.env.example

Ví dụ:

DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=24h

ZNS_PROVIDER=mock
ZALO_APP_ID=
ZALO_SECRET_KEY=
ZALO_TEMPLATE_ID=
ZALO_ACCESS_TOKEN=

STORAGE_PROVIDER=local
STORAGE_PATH=

CUSTOMER_URL=
ADMIN_URL=
API_URL=

========================================
21. PROJECT STRUCTURE
=====================

Tạo project dạng monorepo:

aeon-booking/

apps/

customer/
admin/
api/

packages/

shared-types/
shared-utils/
ui/

database/

prisma/

docs/

README.md

Customer và Admin phải build/deploy độc lập.

========================================
22. DEPLOYMENT
==============

Chuẩn bị deployment cho:

customer:
booking.DOMAIN.com

admin:
admin.DOMAIN.com

api:
api.DOMAIN.com

Backend chạy Node.js.

Database MySQL.

Hướng dẫn:

* Build customer
* Build admin
* Start API
* Setup database
* Setup environment
* Setup domain
* Setup SSL
* Setup CORS
* Setup upload storage
* Setup reverse proxy
* Setup process manager

========================================
23. DEVELOPMENT MODE
====================

Trong development:

customer:
http://localhost:5173

admin:
http://localhost:5174

api:
http://localhost:3000

database:
MySQL localhost.

========================================
24. ADMIN ROLE
==============

Tạo role:

super_admin
admin

super_admin:

* Quản lý admin
* Quản lý tháng
* Quản lý activity
* Quản lý bill
* Xem thống kê

admin:

* Xem bill
* Approve
* Reject
* Xem customer

========================================
25. IMPORTANT BUSINESS RULE
===========================

Không được để Admin frontend trực tiếp thay đổi database.

Flow chính:

CUSTOMER:

Open website
→ Nhập họ tên + SĐT
→ Request OTP
→ Verify OTP
→ Login
→ Chọn tháng
→ Chọn activity
→ Upload bill
→ Pending
→ Admin review
→ Approved / Rejected
→ Customer xem kết quả.

ADMIN:

Login
→ Dashboard
→ Pending bills
→ Xem bill
→ Approve / Reject
→ Customer nhận trạng thái mới.

========================================
26. CODE QUALITY
================

Không viết code demo sơ sài.

Code phải:

* Component-based
* Reusable
* Typed
* Clean architecture
* Environment-based configuration
* Error handling
* Loading state
* Empty state
* Error state
* Form validation
* API error handling
* Responsive
* Accessible

Không hard-code dữ liệu business vào frontend.

========================================
27. DOCUMENTATION
=================

Tạo README.md gồm:

1. Architecture
2. Requirements
3. Installation
4. Environment variables
5. Database setup
6. Development
7. Build
8. Deployment
9. API documentation
10. Admin account setup
11. Zalo ZNS setup
12. File upload configuration
13. Domain configuration
14. Troubleshooting

========================================
28. CÁCH THỰC HIỆN
==================

Không tạo toàn bộ project một cách mù quáng.

Thực hiện theo thứ tự:

PHASE 1:
Phân tích design/brief.

PHASE 2:
Đề xuất architecture.

PHASE 3:
Thiết kế database schema.

PHASE 4:
Thiết kế API.

PHASE 5:
Build Backend.

PHASE 6:
Build Customer Frontend.

PHASE 7:
Build Admin Frontend.

PHASE 8:
Connect frontend với API.

PHASE 9:
Implement OTP/ZNS abstraction.

PHASE 10:
Implement upload bill.

PHASE 11:
Implement approval workflow.

PHASE 12:
Security review.

PHASE 13:
Responsive/UI review.

PHASE 14:
Production deployment documentation.

========================================
29. IMPORTANT
=============

Trước khi bắt đầu code:

* Đọc toàn bộ design/brief tôi cung cấp.
* Liệt kê tất cả screen.
* Liệt kê tất cả user flow.
* Liệt kê database entities.
* Liệt kê API.
* Liệt kê những điểm còn thiếu thông tin.

Nếu thiếu thông tin nhưng không ảnh hưởng architecture:
→ tự chọn phương án hợp lý.

Nếu thiếu thông tin ảnh hưởng business logic:
→ đánh dấu rõ là ASSUMPTION và sử dụng configuration để có thể thay đổi sau.

Không được tự ý bỏ các screen trong design.

Không được tạo mockup thay cho chức năng thật.

Mục tiêu cuối cùng là một hệ thống có thể deploy production, với Customer và Admin là hai source/frontend độc lập, hai domain độc lập và dùng chung Backend API + Database.
