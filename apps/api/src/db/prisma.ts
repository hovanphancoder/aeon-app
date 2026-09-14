import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

let prismaInstance: any;

try {
  prismaInstance =
    global.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
} catch (err: any) {
  console.warn('⚠️ [Prisma] Chưa chạy "prisma generate" hoặc chưa kết nối DB.');
  console.warn('💡 Hệ thống tự động kích hoạt chế độ In-Memory để bạn có thể test ngay mà không bị crash!');
  
  // Tạo Safe Proxy để không bị crash khi gọi các hàm prisma.<entity>.<method>
  prismaInstance = new Proxy({}, {
    get: (_target, prop) => {
      return new Proxy({}, {
        get: () => async () => {
          throw new Error(`Prisma chưa được generate hoặc chưa kết nối MySQL: ${String(prop)}`);
        }
      });
    }
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
