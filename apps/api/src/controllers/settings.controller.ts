import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { inMemoryStore } from '../db/inMemoryStore';

export class SettingsController {
  // Lấy nội dung thể lệ công khai
  static async getRules(_req: Request, res: Response) {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'GENERAL_RULES' },
      });

      return res.status(200).json({
        success: true,
        data: {
          rules: setting ? setting.value : inMemoryStore.rules,
          updatedAt: setting?.updatedAt || new Date(),
        },
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        data: {
          rules: inMemoryStore.rules,
          updatedAt: new Date(),
        },
      });
    }
  }

  // Cập nhật nội dung thể lệ (dành cho Admin)
  static async updateRules(req: Request, res: Response) {
    try {
      const { rules } = req.body;

      if (!rules) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp nội dung thể lệ.',
        });
      }

      const setting = await prisma.systemSetting.upsert({
        where: { key: 'GENERAL_RULES' },
        update: { value: rules },
        create: {
          key: 'GENERAL_RULES',
          description: 'Thể lệ tham gia chương trình kích hoạt AEON Hải Dương',
          value: rules,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thể lệ thành công!',
        data: setting,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi cập nhật thể lệ.',
      });
    }
  }
}
