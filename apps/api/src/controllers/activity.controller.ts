import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { inMemoryStore } from '../db/inMemoryStore';

export class ActivityController {
  // Lấy danh sách hoạt động khả dụng
  static async getActivities(req: Request, res: Response) {
    try {
      const { monthId } = req.query;

      const whereClause: any = {
        status: 'ACTIVE',
      };

      if (monthId && typeof monthId === 'string') {
        whereClause.monthId = monthId;
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
        include: {
          month: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (err) {
      // Fallback in-memory
      return res.status(200).json({
        success: true,
        data: inMemoryStore.activities,
      });
    }
  }

  // Lấy chi tiết hoạt động theo ID
  static async getActivityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await prisma.activity.findUnique({
        where: { id },
        include: {
          month: true,
        },
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          error: 'Hoạt động không tồn tại.',
        });
      }

      return res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi lấy thông tin hoạt động.',
      });
    }
  }
}
