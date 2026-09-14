# AEON HẢI DƯƠNG - HỆ THỐNG BOOKING & PHÊ DUYỆT HÓA ĐƠN

Hệ thống activation/booking cho sự kiện tại AEON Hải Dương gồm 2 frontend độc lập (Khách hàng & Quản trị) dùng chung một Backend API và Database MySQL.

---

## 1. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

```
[Khách Hàng (Customer)]         [Quản Trị Viên (Admin)]
 booking.DOMAIN.com                 admin.DOMAIN.com
 (Mobile-first PWA)                 (Desktop Dashboard)
        │                                    │
        └──────────────┬─────────────────────┘
                       │ REST API (JSON / Multipart)
                       ▼
               [Backend API Server]
                  api.DOMAIN.com
            (Node.js / Express / JWT)
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   [MySQL Database]  [Uploads]    [Zalo ZNS OTP]
   (Prisma ORM)      (Local / S3) (Mock / Official)
```

- **Customer Frontend** (`apps/customer`): Giao diện Mobile-first cho khách quét mã QR tại sự kiện, đăng ký họ tên, xác thực OTP qua Zalo ZNS, chọn tháng/hoạt động, chụp/tải ảnh hóa đơn và nhận kết quả phê duyệt.
- **Admin Frontend** (`apps/admin`): Giao diện Desktop-first cho ban tổ chức/PG theo dõi số liệu real-time, soi ảnh bill phóng to, duyệt hoặc từ chối bill kèm lý do, quản lý tháng và hoạt động.
- **Backend API** (`apps/api`): Xử lý toàn bộ nghiệp vụ, rate limit chống spam, lưu phiên 24h, bảo vệ file upload và cung cấp REST API.
- **Linh hoạt Domain & Proxy**: Không hard-code domain tuyệt đối trong frontend. Trong development và production đều hỗ trợ relative path (`/api`) hoặc biến môi trường `VITE_API_URL`.

---

## 2. YÊU CẦU HỆ THỐNG (REQUIREMENTS)

- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **Trình quản lý gói**: `npm` (v9+) hoặc `pnpm` / `yarn`
- **Database**: MySQL 8.0+ (hoặc MariaDB 10.5+)

---

## 3. CÀI ĐẶT (INSTALLATION)

Tại thư mục gốc dự án `aeon-app`:

```bash
# 1. Cài đặt dependencies cho toàn bộ monorepo (API, Customer, Admin)
npm install

# 2. Tạo file cấu hình môi trường từ mẫu
cp .env.example .env
```

---

## 4. BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

File `.env` tại thư mục gốc:

```env
# Port chạy Backend API
PORT=3000
NODE_ENV=development

# Chuỗi kết nối MySQL
DATABASE_URL="mysql://root:password@localhost:3306/aeon_booking"

# JWT Secret & Thời hạn phiên đăng nhập khách hàng (24 giờ)
JWT_SECRET="aeon_super_secret_jwt_key_hai_duong_2026"
JWT_EXPIRES_IN="24h"

# CORS Origins (Phân cách bởi dấu phẩy)
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,https://booking.yourdomain.com,https://admin.yourdomain.com"

# Cấu hình OTP: "mock" (in ra console / debug trên UI) hoặc "zalo" (gửi ZNS thật)
ZNS_PROVIDER="mock"
ZALO_APP_ID="your_zalo_app_id"
ZALO_SECRET_KEY="your_zalo_secret_key"
ZALO_TEMPLATE_ID="your_zalo_template_id"
ZALO_ACCESS_TOKEN="your_zalo_access_token"

# Cấu hình lưu trữ ảnh bill: "local" hoặc "s3"
STORAGE_PROVIDER="local"
STORAGE_PATH="./uploads"
STORAGE_PUBLIC_URL="/uploads"

# API URL dành cho Frontend (Để trống nếu dùng proxy relative path)
VITE_API_URL=""
```

---

## 5. THIẾT LẬP DATABASE (DATABASE SETUP)

```bash
# 1. Tạo database schema với Prisma
npm run db:migrate

# 2. Sinh Prisma Client
npm run db:generate

# 3. Seed dữ liệu ban đầu (Tạo Admin mặc định, Tháng 10, 11, 12, Workshop mẫu, Thể lệ)
npm run db:seed
```

---

## 6. CHẠY DEVELOPMENT (DEVELOPMENT MODE)

Mở các terminal độc lập để chạy từng service:

```bash
# Terminal 1: Backend API (Chạy tại http://localhost:3000)
npm run dev:api

# Terminal 2: Customer Frontend (Chạy tại http://localhost:5173)
npm run dev:customer

# Terminal 3: Admin Frontend (Chạy tại http://localhost:5174)
npm run dev:admin
```

> **Lưu ý về Dev Proxy**: Cả Customer (`5173`) và Admin (`5174`) đã được cấu hình sẵn Vite Proxy chuyển hướng mọi request `/api` và `/uploads` sang port `3000`. Do đó không cần sửa domain tuyệt đối khi chạy local.

---

## 7. BUILD PRODUCTION (BUILD)

```bash
# Build tất cả các ứng dụng
npm run build
```
Kết quả build:
- Customer Frontend: `apps/customer/dist/`
- Admin Frontend: `apps/admin/dist/`
- Backend API: `apps/api/dist/`

---

## 8. TRIỂN KHAI PRODUCTION (DEPLOYMENT)

### Mô hình Nginx Reverse Proxy khuyến nghị:

```nginx
# 1. Customer Frontend (booking.yourdomain.com)
server {
    server_name booking.yourdomain.com;
    root /var/www/aeon/apps/customer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
    }
}

# 2. Admin Frontend (admin.yourdomain.com)
server {
    server_name admin.yourdomain.com;
    root /var/www/aeon/apps/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 3. Backend API (api.yourdomain.com) - Chạy bằng PM2
# pm2 start apps/api/dist/index.js --name "aeon-api"
```

---

## 9. TÀI LIỆU API (API SPECIFICATION)

### A. Customer API
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/auth/request-otp` | Gửi OTP qua SĐT (Rate limit 5 lần/10p) |
| `POST` | `/api/auth/verify-otp` | Xác thực OTP & cấp Session JWT 24h |
| `GET` | `/api/auth/me` | Kiểm tra trạng thái đăng nhập hiện tại |
| `POST` | `/api/auth/logout` | Đăng xuất |
| `GET` | `/api/months` | Danh sách các tháng (`ACTIVE`, `COMING_SOON`) |
| `GET` | `/api/activities` | Danh sách hoạt động (hỗ trợ `?monthId=...`) |
| `POST` | `/api/bills` | Tải ảnh hóa đơn lên (Multipart: `billImage`, `activityId`) |
| `GET` | `/api/bills/:id` | Thăm dò trạng thái duyệt hóa đơn (`pending`/`approved`/`rejected`) |
| `GET` | `/api/settings/rules` | Lấy nội dung thể lệ chương trình |

### B. Admin API
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/admin/auth/login` | Đăng nhập Admin |
| `GET` | `/api/admin/auth/me` | Thông tin tài khoản Admin |
| `GET` | `/api/admin/dashboard` | Thống kê số liệu, tỷ lệ duyệt |
| `GET` | `/api/admin/bills` | Danh sách bill (Filter, Search, Phân trang) |
| `POST` | `/api/admin/bills/:id/approve` | Phê duyệt hóa đơn |
| `POST` | `/api/admin/bills/:id/reject` | Từ chối hóa đơn kèm lý do (`adminNote`) |
| `GET/PUT` | `/api/admin/months` | Quản lý trạng thái tháng |
| `GET/POST/PUT`| `/api/admin/activities` | Quản lý workshop/hoạt động |
| `GET` | `/api/admin/customers` | Danh sách khách hàng và lịch sử bill |
| `PUT` | `/api/admin/settings/rules` | Cập nhật thể lệ (Super Admin) |

---

## 10. TÀI KHOẢN ADMIN MẶC ĐỊNH

Sau khi chạy lệnh `npm run db:seed`:
- **Email**: `admin@aeon.vn`
- **Mật khẩu**: `admin123456`
- **Quyền hạn**: `super_admin`

---

## 11. CẤU HÌNH ZALO ZNS OTP

1. Khi phát triển (`ZNS_PROVIDER="mock"`): Mã OTP ngẫu nhiên 6 chữ số sẽ được in trực tiếp ra Terminal của Backend API và hiển thị box gợi ý trên màn hình khách hàng để kiểm thử nhanh chóng.
2. Khi triển khai thật (`ZNS_PROVIDER="zalo"`): Điền các thông tin từ Zalo Cloud Account:
   - `ZALO_APP_ID`
   - `ZALO_SECRET_KEY`
   - `ZALO_TEMPLATE_ID`
   - `ZALO_ACCESS_TOKEN`

---

## 12. BẢO MẬT & QUY TẮC PHÊ DUYỆT

1. **Ghi nhớ Session 24h**: Khách hàng chỉ cần xác thực OTP 1 lần vào buổi sáng, các lần quét mã QR sau trong ngày sẽ được tự động nhận diện và vào thẳng màn hình Chọn Tháng / Nộp Bill.
2. **Quy tắc tham gia nhiều lần**: Một khách hàng có thể nộp nhiều hóa đơn và tham gia nhiều hoạt động khác nhau, miễn là mỗi hóa đơn đều được admin duyệt hợp lệ.
3. **Chống spam**: Khách hàng chỉ được phép có tối đa 1 hóa đơn ở trạng thái `pending` tại 1 thời điểm. Phải đợi ban tổ chức duyệt xong bill trước đó mới được nộp tiếp bill mới.
4. **An toàn tập tin**: File tải lên được kiểm tra MIME type (`image/jpeg`, `image/png`, `image/webp`), giới hạn 10MB và được đổi tên bằng UUID v4 để ngăn chặn hoàn toàn tấn công thực thi mã độc.

---

## 13. XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

- **Lỗi kết nối Database**: Kiểm tra thông số `DATABASE_URL` trong file `.env` đã đúng cổng MySQL (mặc định 3306) và MySQL service đã khởi động.
- **Lỗi CORS**: Kiểm tra `CORS_ORIGINS` trong `.env` đã bao gồm domain frontend của bạn hay chưa.
- **Không thấy ảnh bill sau khi tải**: Kiểm tra quyền ghi (write permission) của thư mục `apps/api/uploads`.
#   a e o n - a p p  
 