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

      // Đảm bảo Customer đã tồn tại trong MySQL để tránh vi phạm Foreign Key
      let dbCustomer: any = null;
      try {
        if (req.customer?.phone) {
          dbCustomer = await prisma.customer.upsert({
            where: { phone: req.customer.phone },
            update: { name: req.customer.name || 'Khách hàng AEON' },
            create: {
              phone: req.customer.phone,
              name: req.customer.name || 'Khách hàng AEON',
            },
          });
        } else if (req.customer?.id) {
          dbCustomer = await prisma.customer.findUnique({
            where: { id: req.customer.id },
          });
        }
      } catch (custErr) {
        console.warn('⚠️ [MySQL] Không thể upsert Customer:', custErr);
      }

      // Kiểm tra hoạt động có tồn tại và đang active không
      let dbActivity: any = null;
      try {
        dbActivity = await prisma.activity.findFirst({
          where: {
            OR: [
              { id: activityId },
              { id: activityId === 'act-1' ? 'act-nail-xinh-10' : activityId === 'act-2' ? 'act-net-dieu-10' : undefined },
              { slug: 'nail-xinh-tang-nang' },
            ],
          },
          include: { month: true },
        });

        if (!dbActivity) {
          dbActivity = await prisma.activity.findFirst({ include: { month: true } });
        }
      } catch {
        // Fallback
      }

      let activity = dbActivity;
      if (!activity) {
        activity = inMemoryStore.activities.find(
          (a) => a.id === activityId || 
                 (activityId === 'act-1' && a.id === 'act-nail-xinh-10') ||
                 (activityId === 'act-2' && a.id === 'act-net-dieu-10')
        );
      }

      if (!activity) {
        activity = inMemoryStore.activities[0];
      }

      // Lưu file hóa đơn qua Storage Service
      const billImageUrl = await storageService.saveFile(file);

      // Tạo bản ghi nộp bill (Lưu vào MySQL nếu DB khả dụng)
      let submission: any = null;
      if (dbCustomer && dbActivity) {
        try {
          submission = await prisma.billSubmission.create({
            data: {
              customerId: dbCustomer.id,
              monthId: dbActivity.monthId,
              activityId: dbActivity.id,
              billImage: billImageUrl,
              status: 'pending',
            },
            include: {
              activity: true,
              month: true,
              customer: true,
            },
          });
          console.log('✅ Đã lưu hóa đơn vào MySQL thành công, ID:', submission.id);
          inMemoryStore.bills.set(submission.id, submission);
        } catch (dbErr: any) {
          console.error('❌ Lỗi khi lưu bill vào MySQL:', dbErr.message);
        }
      }

      // Nếu MySQL offline hoặc lưu thất bại, lưu tạm vào RAM Store
      if (!submission) {
        const billId = `bill-${Date.now()}`;
        submission = {
          id: billId,
          customerId: dbCustomer?.id || req.customer.id,
          monthId: dbActivity?.monthId || activity.monthId || 'b39b662e-79bd-44d9-af7e-2696eb028452',
          activityId: dbActivity?.id || activity.id,
          billImage: billImageUrl,
          status: 'pending',
          adminNote: null,
          submittedAt: new Date(),
          customer: dbCustomer || req.customer,
          activity: dbActivity || activity,
          month: dbActivity?.month || activity.month || { id: activity.monthId || 'month-10', name: 'THÁNG 10' },
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
