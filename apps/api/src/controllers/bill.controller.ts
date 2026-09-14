import { Response } from 'express';
import { AuthenticatedCustomerRequest } from '../middleware/auth.middleware';
import prisma from '../db/prisma';
import { inMemoryStore } from '../db/inMemoryStore';
import { storageService } from '../services/storage.service';

export class BillController {
  // 1. Nộp ảnh hóa đơn
  static async submitBill(req: AuthenticatedCustomerRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const { activityId } = req.body;
      const file = req.file;

      if (!activityId) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng chọn hoạt động tham gia.',
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng chụp hoặc tải lên hình ảnh hóa đơn mua sắm.',
        });
      }

      // Kiểm tra hoạt động có tồn tại và đang active không
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { month: true },
      });

      if (!activity || activity.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: 'Hoạt động này hiện không khả dụng.',
        });
      }

      // Kiểm tra chống spam: Không cho phép gửi tiếp nếu có bill đang PENDING
      const existingPending = await prisma.billSubmission.findFirst({
        where: {
          customerId: req.customer.id,
          status: 'pending',
        },
      });

      if (existingPending) {
        return res.status(400).json({
          success: false,
          error: 'Quý khách đang có 1 hóa đơn đang chờ ban tổ chức duyệt. Vui lòng chờ kết quả trước khi gửi tiếp.',
          data: { pendingBillId: existingPending.id },
        });
      }

      // Lưu file hóa đơn qua Storage Service
      const billImageUrl = await storageService.saveFile(file);

      // Tạo bản ghi nộp bill (hỗ trợ RAM fallback)
      let submission: any = null;
      try {
        submission = await prisma.billSubmission.create({
          data: {
            customerId: req.customer.id,
            monthId: activity.monthId,
            activityId: activity.id,
            billImage: billImageUrl,
            status: 'pending',
          },
          include: {
            activity: true,
            month: true,
          },
        });
      } catch (dbErr) {
        const billId = `bill-${Date.now()}`;
        submission = {
          id: billId,
          customerId: req.customer.id,
          monthId: activity.monthId,
          activityId: activity.id,
          billImage: billImageUrl,
          status: 'pending',
          adminNote: null,
          submittedAt: new Date(),
          customer: req.customer,
          activity: activity,
          month: activity.month || { id: activity.monthId, name: 'THÁNG 10' },
        };
        inMemoryStore.bills.set(billId, submission);
      }

      return res.status(201).json({
        success: true,
        message: 'Gửi hóa đơn thành công! Vui lòng chờ trong giây lát để ban tổ chức kiểm tra.',
        data: submission,
      });
    } catch (err: any) {
      console.error('[BillController.submitBill] Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Lỗi khi gửi hóa đơn. Vui lòng thử lại.',
      });
    }
  }

  // 2. Tra cứu trạng thái một hóa đơn (dành cho Customer polling)
  static async getBillStatus(req: AuthenticatedCustomerRequest, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.customer?.id;

      let bill: any = null;
      try {
        bill = await prisma.billSubmission.findFirst({
          where: {
            id,
            customerId,
          },
          include: {
            activity: {
              select: {
                id: true,
                name: true,
                description: true,
                rules: true,
              },
            },
            month: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      } catch {
        bill = inMemoryStore.bills.get(id);
      }

      if (!bill) {
        bill = inMemoryStore.bills.get(id);
      }

      if (!bill) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy hóa đơn.',
        });
      }

      return res.status(200).json({
        success: true,
        data: bill,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi tra cứu hóa đơn.',
      });
    }
  }

  // 3. Lấy toàn bộ lịch sử hóa đơn của khách hàng
  static async getMyBills(req: AuthenticatedCustomerRequest, res: Response) {
    try {
      if (!req.customer) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const bills = await prisma.billSubmission.findMany({
        where: { customerId: req.customer.id },
        include: {
          activity: true,
          month: true,
        },
        orderBy: { submittedAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: bills,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Lỗi tải lịch sử hóa đơn.',
      });
    }
  }
}
