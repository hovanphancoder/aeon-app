// In-Memory Store dự phòng khi MySQL chưa khởi động
// Giúp lập trình viên có thể test toàn bộ luồng ngay lập tức

export interface MockOtp {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

export interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface MockBill {
  id: string;
  customerId: string;
  monthId: string;
  activityId: string;
  billImage: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  submittedAt: Date;
  customer?: MockCustomer;
  activity?: any;
  month?: any;
}

class InMemoryStore {
  otps = new Map<string, MockOtp>();
  customers = new Map<string, MockCustomer>();
  bills = new Map<string, MockBill>();

  months = [
    {
      id: 'month-10',
      name: 'THÁNG 10',
      slug: 'thang-10',
      status: 'ACTIVE',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    },
    {
      id: 'month-11',
      name: 'THÁNG 11',
      slug: 'thang-11',
      status: 'COMING_SOON',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    },
    {
      id: 'month-12',
      name: 'THÁNG 12',
      slug: 'thang-12',
      status: 'COMING_SOON',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-31'),
    },
  ];

  activities = [
    {
      id: 'act-nail-xinh-10',
      monthId: 'month-10',
      name: 'NAIL XINH TẶNG NÀNG',
      slug: 'nail-xinh-tang-nang',
      description: 'Tham gia workshop làm nail nghệ thuật và nhận ngay 1 bộ nail box cao cấp từ các nghệ nhân.',
      rules: 'Áp dụng cho hóa đơn mua sắm từ 300.000 VNĐ tại khu vực Thời trang & Làm đẹp AEON Hải Dương.',
      status: 'ACTIVE',
      banner: null,
      month: { id: 'month-10', name: 'THÁNG 10', status: 'ACTIVE' },
    },
    {
      id: 'act-net-dieu-10',
      monthId: 'month-10',
      name: 'NÉT ĐIỆU CHO NÀNG',
      slug: 'net-dieu-cho-nang',
      description: 'Workshop trải nghiệm trang điểm phong cách Hàn Quốc và nhận set quà mỹ phẩm đặc biệt.',
      rules: 'Áp dụng cho hóa đơn mua hàng từ 500.000 VNĐ bất kỳ tại AEON Hải Dương.',
      status: 'ACTIVE',
      banner: null,
      month: { id: 'month-10', name: 'THÁNG 10', status: 'ACTIVE' },
    },
  ];

  rules = `### ĐIỀU KIỆN & THỂ LỆ THAM GIA CHƯƠNG TRÌNH

1. **Đối tượng tham gia**:
   - Tất cả khách hàng mua sắm tại Trung tâm thương mại AEON Hải Dương có hóa đơn mua hàng hợp lệ trong thời gian diễn ra chương trình.

2. **Cách thức tham gia**:
   - Bước 1: Quét mã QR tại các booth kích hoạt hoặc truy cập trang web chương trình.
   - Bước 2: Nhập số điện thoại và xác thực mã OTP gửi về máy.
   - Bước 3: Lựa chọn tháng và hoạt động/workshop bạn muốn tham gia.
   - Bước 4: Chụp ảnh hóa đơn mua sắm rõ nét (đầy đủ ngày giờ, giá trị, số hóa đơn) và bấm gửi.
   - Bước 5: Chờ trong giây lát để ban tổ chức kiểm tra và phê duyệt.

3. **Quy định hóa đơn & Lượt tham gia**:
   - Mỗi khách hàng được tham gia nhiều lần và tham gia được nhiều hoạt động, miễn là có hóa đơn hợp lệ được xác nhận.
   - Hóa đơn phải còn nguyên vẹn, không mờ, không tẩy xóa, chụp đầy đủ góc cạnh.
   - Mỗi hóa đơn chỉ được sử dụng cho một lần đăng ký hoạt động duy nhất.`;
}

export const inMemoryStore = new InMemoryStore();
