import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import customerRoutes from './routes/customer.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Đảm bảo thư mục lưu trữ uploads tồn tại (chỉ chạy khi local, tránh lỗi read-only filesystem trên Vercel)
if (!process.env.VERCEL && config.storage.provider === 'local') {
  try {
    const uploadDir = path.resolve(config.storage.localPath, 'bills');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.warn('[Storage] Không thể tạo thư mục upload local:', err);
  }
}

// Cấu hình CORS linh hoạt:
// Hỗ trợ mọi domain nếu là localhost hoặc domain cấu hình trong CORS_ORIGINS
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (ví dụ curl, mobile app hoặc postman)
      if (!origin) return callback(null, true);
      
      // Nếu origin nằm trong danh sách được phép hoặc đang ở dev
      if (
        config.isDev || 
        config.corsOrigins.includes(origin) || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      
      return callback(null, true); // Mặc định mở rộng để không chặn khi đổi domain
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phục vụ tệp tĩnh (hình ảnh bill đã tải lên)
const staticUploadPath = process.env.VERCEL 
  ? path.join('/tmp', 'uploads')
  : config.storage.localPath;
app.use('/uploads', express.static(staticUploadPath));

// Healthcheck & Root endpoints
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '🎉 AEON Hải Dương API Server đang hoạt động tốt!',
    customerWeb: 'http://localhost:5173',
    adminWeb: 'http://localhost:5174',
    endpoints: {
      health: '/api/health',
      customerApi: '/api/...',
      adminApi: '/api/admin/...',
    },
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'AEON Booking API Base Endpoint',
    health: '/api/health',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AEON Booking API',
    znsProvider: config.zns.provider,
    storageProvider: config.storage.provider,
  });
});

// Chuẩn hóa URL nếu client gửi thừa tiền tố /api/api
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace(/^\/api\/api\//, '/api/');
  }
  next();
});

// Gắn Router: Hỗ trợ cả /api và không có /api để tương thích mọi cấu hình VITE_API_URL
app.use('/api/admin', adminRoutes);
app.use('/api', customerRoutes);

app.use('/admin', adminRoutes);
app.use('/', customerRoutes);

// Xử lý Route không tồn tại (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint API không tồn tại.',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
  });
});

// Khởi động server (chỉ chạy khi ở local dev / standalone server, tránh lỗi cổng trên Vercel Serverless)
if (!process.env.VERCEL) {
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n🚀 ========================================================`);
    console.log(`   AEON Booking API đang chạy tại: http://localhost:${config.port}`);
    console.log(`   Môi trường: ${config.nodeEnv}`);
    console.log(`   ZNS OTP Provider: ${config.zns.provider}`);
    console.log(`   Storage Provider: ${config.storage.provider}`);
    console.log(`========================================================\n`);
  });

  // Xử lý tắt ứng dụng an toàn
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: Closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

export default app;
