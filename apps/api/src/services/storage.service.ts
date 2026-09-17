import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export interface IStorageService {
  saveFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  // constructor() {
  //   this.uploadDir = path.resolve(config.storage.localPath, 'bills');
  //   if (!fs.existsSync(this.uploadDir)) {
  //     fs.mkdirSync(this.uploadDir, { recursive: true });
  //   }
  // }
  constructor() {
    this.uploadDir = path.join('/tmp', 'uploads', 'bills');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
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

    // Trả về đường dẫn truy cập công khai
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

// S3-compatible storage placeholder (Dễ dàng mở rộng cho AWS S3 hoặc Cloudflare R2)
export class S3StorageService implements IStorageService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    console.log(`[S3StorageService] Saving file ${filename} (buffer size: ${file.size})`);
    // Placeholder URL khi dùng S3
    return `https://s3.placeholder.com/bills/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    console.log(`[S3StorageService] Deleting file ${fileUrl}`);
    return true;
  }
}

// Factory khởi tạo Storage Service dựa theo biến môi trường
export function getStorageService(): IStorageService {
  if (config.storage.provider === 's3') {
    return new S3StorageService();
  }
  return new LocalStorageService();
}

export const storageService = getStorageService();
