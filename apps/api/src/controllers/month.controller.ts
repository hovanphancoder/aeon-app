import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { inMemoryStore } from '../db/inMemoryStore';

export class MonthController {
  // Lấy danh sách tháng cho Customer
  static async getMonths(_req: Request, res: Response) {
    try {
      const months = await prisma.month.findMany({
        where: {
          status: { in: ['ACTIVE', 'COMING_SOON'] }
        },
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: months,
      });
    } catch (err) {
      // Fallback in-memory
      return res.status(200).json({
        success: true,
        data: inMemoryStore.months,
      });
    }
  }

  // Lấy chi tiết 1 tháng kèm các hoạt động
  static async getMonthById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const month = await prisma.month.findUnique({
        where: { id },
        include: {
          activities: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!month) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thông tin tháng này.',
        });
      }

      return res.status(200).json({
        success: true,
        data: month,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi lấy thông tin chi tiết tháng.',
      });
    }
  }
}
