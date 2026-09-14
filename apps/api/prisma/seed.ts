import { PrismaClient, MonthStatus, ActivityStatus, AdminRole, AdminStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang khởi tạo dữ liệu mẫu cho hệ thống AEON Hải Dương ---');

  // 1. Tạo Tài khoản Super Admin
  const adminEmail = 'admin@aeon.vn';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    const admin = await prisma.admin.create({
      data: {
        name: 'Quản Trị Viên AEON',
        email: adminEmail,
        passwordHash: passwordHash,
        role: AdminRole.super_admin,
        status: AdminStatus.ACTIVE,
      }
    });
    console.log(`✓ Đã tạo Admin mặc định: ${admin.email} (Mật khẩu: admin123456)`);
  } else {
    console.log(`ℹ Admin ${adminEmail} đã tồn tại.`);
  }

  // 2. Tạo Cài đặt Thể lệ chung
  const existingRules = await prisma.systemSetting.findUnique({
    where: { key: 'GENERAL_RULES' }
  });

  if (!existingRules) {
    await prisma.systemSetting.create({
      data: {
        key: 'GENERAL_RULES',
        description: 'Thể lệ tham gia chương trình kích hoạt AEON Hải Dương',
        value: `### ĐIỀU KIỆN & THỂ LỆ THAM GIA CHƯƠNG TRÌNH

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
   - Mỗi hóa đơn chỉ được sử dụng cho một lần đăng ký hoạt động duy nhất.

4. **Hỗ trợ**:
   - Nếu gặp khó khăn trong quá trình đăng ký hoặc hóa đơn bị từ chối, vui lòng liên hệ ngay với nhân viên PG trực tại booth để được hỗ trợ trực tiếp.`
      }
    });
    console.log('✓ Đã khởi tạo Thể Lệ Chương Trình.');
  }

  // 3. Tạo Tháng 10, 11, 12
  const month10 = await prisma.month.upsert({
    where: { slug: 'thang-10' },
    update: {},
    create: {
      name: 'THÁNG 10',
      slug: 'thang-10',
      status: MonthStatus.ACTIVE,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    }
  });

  const month11 = await prisma.month.upsert({
    where: { slug: 'thang-11' },
    update: {},
    create: {
      name: 'THÁNG 11',
      slug: 'thang-11',
      status: MonthStatus.COMING_SOON,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    }
  });

  const month12 = await prisma.month.upsert({
    where: { slug: 'thang-12' },
    update: {},
    create: {
      name: 'THÁNG 12',
      slug: 'thang-12',
      status: MonthStatus.COMING_SOON,
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-31'),
    }
  });
  console.log('✓ Đã tạo danh sách Tháng: Tháng 10 (ACTIVE), Tháng 11 (COMING SOON), Tháng 12 (COMING SOON).');

  // 4. Tạo Hoạt động cho Tháng 10
  const act1 = await prisma.activity.upsert({
    where: { id: 'act-nail-xinh-10' },
    update: {},
    create: {
      id: 'act-nail-xinh-10',
      monthId: month10.id,
      name: 'NAIL XINH TẶNG NÀNG',
      slug: 'nail-xinh-tang-nang',
      description: 'Tham gia workshop làm nail nghệ thuật và nhận ngay 1 bộ nail box cao cấp từ các nghệ nhân.',
      rules: 'Áp dụng cho hóa đơn mua sắm từ 300.000 VNĐ tại khu vực Thời trang & Làm đẹp AEON Hải Dương.',
      status: ActivityStatus.ACTIVE,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    }
  });

  const act2 = await prisma.activity.upsert({
    where: { id: 'act-net-dieu-10' },
    update: {},
    create: {
      id: 'act-net-dieu-10',
      monthId: month10.id,
      name: 'NÉT ĐIỆU CHO NÀNG',
      slug: 'net-dieu-cho-nang',
      description: 'Workshop trải nghiệm trang điểm phong cách Hàn Quốc và nhận set quà mỹ phẩm đặc biệt.',
      rules: 'Áp dụng cho hóa đơn mua hàng từ 500.000 VNĐ bất kỳ tại AEON Hải Dương.',
      status: ActivityStatus.ACTIVE,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    }
  });
  console.log('✓ Đã tạo Hoạt động mẫu: NAIL XINH TẶNG NÀNG và NÉT ĐIỆU CHO NÀNG.');

  console.log('--- Hoàn thành khởi tạo dữ liệu! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
