# HƯỚNG DẪN CẤU HÌNH CLOUDINARY LƯU TRỮ ẢNH HÓA ĐƠN VĨNH VIỄN TRÊN VERCEL

Tài liệu này dùng để lưu lại và kích hoạt tính năng lưu ảnh hóa đơn qua **Cloudinary** (miễn phí 25GB, CDN toàn cầu, nén ảnh tự động) khi bạn sẵn sàng cấu hình.

---

## 📌 Bối Cảnh & Trạng Thái Hiện Tại

1. **Mã nguồn đã được tích hợp sẵn 100%:**
   * File dịch vụ: `apps/api/src/services/storage.service.ts` (`CloudinaryStorageService`)
   * Cấu hình nạp biến: `apps/api/src/config/index.ts`
   * Thư viện: Đã cài sẵn `cloudinary` trong `package.json`

2. **Tại sao cần Cloudinary trên Vercel?**
   * Vercel Serverless Functions không có ổ đĩa lưu trữ vĩnh viễn (chỉ có thư mục tạm `/tmp` sẽ bị xóa sau vài phút).
   * Khi bật Cloudinary, ảnh chụp từ điện thoại / máy tính sẽ được đẩy thẳng lên đám mây Cloudinary và nhận về link vĩnh viễn:
     `https://res.cloudinary.com/<your-cloud-name>/image/upload/v.../aeon_bills/xxx.webp`
   * Link này được lưu vào MySQL / bộ nhớ, hiển thị mượt mà trên cả Web Admin và Web Customer mà không bao giờ bị mất ảnh.

---

## 🛠️ Hướng Dẫn Thực Hiện Từng Bước (Chỉ mất 2 - 3 phút)

### Bước 1: Đăng ký tài khoản Cloudinary miễn phí
1. Truy cập: [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Bạn có thể chọn **Sign up with Google** để đăng ký trong 10 giây.
3. Sau khi vào màn hình chính (**Dashboard / Console**), bạn sẽ thấy phần **Product Environment Credentials**:
   * **Cloud Name**: (ví dụ: `dxyzt123`)
   * **API Key**: (ví dụ: `872164821948123`)
   * **API Secret**: (ví dụ: `aBcDeFgHiJkLmNoPqRsTuVwXyZ` - bấm nút Copy)

---

### Bước 2: Cấu hình biến môi trường trên Vercel

1. Truy cập: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Chọn dự án Backend: **`aeon-app-api`**
3. Vào tab **Settings** ➡️ Chọn menu **Environment Variables** ở cột trái.
4. Thêm 4 biến môi trường sau (chọn áp dụng cho cả `Production`, `Preview`, `Development`):

| Tên Biến (Key) | Giá Trị (Value) | Ghi Chú |
| :--- | :--- | :--- |
| `STORAGE_PROVIDER` | `cloudinary` | Kích hoạt bộ nạp Cloudinary |
| `CLOUDINARY_CLOUD_NAME` | `<Cloud Name của bạn>` | Lấy từ bước 1 |
| `CLOUDINARY_API_KEY` | `<API Key của bạn>` | Lấy từ bước 1 |
| `CLOUDINARY_API_SECRET` | `<API Secret của bạn>` | Lấy từ bước 1 |
| `CLOUDINARY_FOLDER` | `aeon_bills` | *(Tùy chọn)* Thư mục chứa ảnh trên Cloudinary |

5. Bấm nút **Save**.

---

### Bước 3: Redeploy để Vercel áp dụng biến mới
1. Trên Vercel Dashboard của project `aeon-app-api`, vào tab **Deployments**.
2. Tìm bản deploy trên cùng (mới nhất), bấm vào **dấu 3 chấm `...`** ở góc phải.
3. Chọn **Redeploy**.
4. Chờ khoảng 30 - 45 giây để Vercel build lại.

---

### Bước 4 (Tùy chọn): Cấu hình chạy test dưới máy Local
Nếu bạn muốn máy tính cá nhân khi chạy `npm run dev:api` cũng lưu ảnh lên Cloudinary:
Mở file `apps/api/.env` và điền:
```env
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="<Cloud Name của bạn>"
CLOUDINARY_API_KEY="<API Key của bạn>"
CLOUDINARY_API_SECRET="<API Secret của bạn>"
CLOUDINARY_FOLDER="aeon_bills"
```

---

## 🧪 Cách Kiểm Tra Sau Khi Cấu Hình Thành Công

1. Mở Web Khách hàng (Customer Web).
2. Đăng nhập bằng số điện thoại ➡️ Chọn hoạt động (ví dụ: *Nail Xinh Tặng Nàng*).
3. Chụp và gửi 1 ảnh hóa đơn bất kỳ.
4. Mở Web Admin ➡️ Vào mục **Phê Duyệt Hóa Đơn** (Quản lý hóa đơn):
   * Link ảnh của hóa đơn đó sẽ có dạng bắt đầu bằng:
     `https://res.cloudinary.com/...`
   * Bấm vào xem ảnh sẽ hiển thị rõ nét ngay lập tức.
5. Bạn cũng có thể vào trực tiếp trang [Cloudinary Media Library](https://console.cloudinary.com/console/media_library) để thấy ảnh hóa đơn nằm ngay ngắn trong thư mục `aeon_bills`.
