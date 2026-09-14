import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const storage = multer.memoryStorage();

export const uploadBillMiddleware = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSize, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (config.storage.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tệp không hợp lệ. Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, HEIC.`));
    }
  },
}).single('billImage');

// Wrapper xử lý lỗi Multer thân thiện
export function handleUploadErrors(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Kích thước ảnh vượt quá giới hạn cho phép (Tối đa 10MB).',
      });
    }
    return res.status(400).json({
      success: false,
      error: `Lỗi tải tệp: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Lỗi xử lý tệp tin tải lên.',
    });
  }
  next();
}
