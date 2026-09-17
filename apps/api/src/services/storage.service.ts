import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

export interface IStorageService {
  saveFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

/**
 * Local Storage Service (Dành cho Local Dev)
 */
export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.VERCEL
      ? path.join('/tmp', 'uploads', 'bills')
      : path.resolve(config.storage.localPath, 'bills');

    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[LocalStorageService] Could not create upload directory:', err);
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();

    // Kiểm tra extension an toàn
    if (!config.storage.allowedExtensions.includes(ext)) {
      throw new Error(`Định dạng tệp không được hỗ trợ: ${ext}. Chỉ chấp nhận ảnh JPG, PNG, WEBP, HEIC.`);
    }

    // Đổi tên ngẫu nhiên bằng UUID để bảo mật
    const filename = `${uuidv4()}${ext}`;
    const targetPath = path.join(this.uploadDir, filename);

    // Lưu buffer vào file system
    await fs.promises.writeFile(targetPath, file.buffer);

    // Nếu chạy Vercel, trả về URL đầy đủ kèm domain API để web Admin/Customer hiển thị được
    if (process.env.VERCEL) {
      const apiHost = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://aeon-app-api.vercel.app';
      return `${apiHost}/uploads/bills/${filename}`;
    }

    return `${config.storage.publicUrl}/bills/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Cloudinary Storage Service (Dành cho Production trên Vercel / Cloud)
 * Miễn phí 25GB, tự động tối ưu hóa ảnh và CDN toàn cầu
 */
export class CloudinaryStorageService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: config.storage.cloudinary.cloudName,
      api_key: config.storage.cloudinary.apiKey,
      api_secret: config.storage.cloudinary.apiSecret,
      secure: true,
    });
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!config.storage.allowedExtensions.includes(ext)) {
      throw new Error(`Định dạng tệp không được hỗ trợ: ${ext}. Chỉ chấp nhận ảnh JPG, PNG, WEBP, HEIC.`);
    }

    if (!config.storage.cloudinary.cloudName || !config.storage.cloudinary.apiKey || !config.storage.cloudinary.apiSecret) {
      throw new Error(
        'Cloudinary chưa được cấu hình. Vui lòng kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong biến môi trường.'
      );
    }

    return new Promise((resolve, reject) => {
      const publicId = `${uuidv4()}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: config.storage.cloudinary.folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }, // Tự động tối ưu dung lượng & webp format
          ],
        },
        (error, result) => {
          if (error) {
            console.error('[CloudinaryStorageService] Upload error:', error);
            return reject(new Error(`Tải ảnh lên Cloudinary thất bại: ${error.message}`));
          }
          if (!result || !result.secure_url) {
            return reject(new Error('Cloudinary không trả về URL ảnh hợp lệ.'));
          }
          resolve(result.secure_url);
        }
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Trích xuất public_id từ URL Cloudinary (ví dụ: aeon_bills/uuid)
      const parts = fileUrl.split('/');
      const filenameWithExt = parts[parts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      const folder = config.storage.cloudinary.folder;
      const publicId = folder ? `${folder}/${filename}` : filename;

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (err) {
      console.error('[CloudinaryStorageService] Delete error:', err);
      return false;
    }
  }
}

/**
 * S3-compatible storage placeholder (AWS S3 hoặc Cloudflare R2)
 */
export class S3StorageService implements IStorageService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    console.log(`[S3StorageService] Saving file ${filename} (buffer size: ${file.size})`);
    return `https://s3.placeholder.com/bills/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    console.log(`[S3StorageService] Deleting file ${fileUrl}`);
    return true;
  }
}

// Factory khởi tạo Storage Service dựa theo biến môi trường
export function getStorageService(): IStorageService {
  if (config.storage.provider === 'cloudinary') {
    return new CloudinaryStorageService();
  }
  if (config.storage.provider === 's3') {
    return new S3StorageService();
  }
  return new LocalStorageService();
}

export const storageService = getStorageService();
