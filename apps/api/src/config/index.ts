import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/api or project root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/aeon_booking',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'aeon_default_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS: Cho phép cấu hình danh sách domain, hoặc mặc định mở cho localhost
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    
  // Zalo ZNS OTP
  zns: {
    provider: process.env.ZNS_PROVIDER || 'mock', // 'mock' | 'zalo'
    appId: process.env.ZALO_APP_ID || '',
    secretKey: process.env.ZALO_SECRET_KEY || '',
    templateId: process.env.ZALO_TEMPLATE_ID || '',
    accessToken: process.env.ZALO_ACCESS_TOKEN || '',
    otpTtlMinutes: 3, // 3 phút
  },
  
  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 's3'
    localPath: process.env.STORAGE_PATH || path.resolve(__dirname, '../../uploads'),
    publicUrl: process.env.STORAGE_PUBLIC_URL || '/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
  }
};
