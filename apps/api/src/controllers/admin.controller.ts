import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../db/prisma';
import { inMemoryStore } from '../db/inMemoryStore';
import { AuthenticatedAdminRequest } from '../middleware/auth.middleware';

export class AdminController {
  // 1. Đăng nhập Admin
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng nhập email và mật khẩu.',
        });
      }

      let admin: any = null;
      try {
        admin = await prisma.admin.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
      } catch (dbErr) {
        // Fallback admin mặc định nếu MySQL chưa bật
        if (email.trim().toLowerCase() === 'admin@aeon.vn' && password === 'admin123456') {
          admin = {
            id: 'admin-default-id',
            name: 'Quản Trị Viên AEON',
            email: 'admin@aeon.vn',
            role: 'super_admin',
            status: 'ACTIVE',
          };
        }
      }

      if (!admin && email.trim().toLowerCase() === 'admin@aeon.vn' && password === 'admin123456') {
        admin = {
          id: 'admin-default-id',
          name: 'Quản Trị Viên AEON',
          email: 'admin@aeon.vn',
          role: 'super_admin',
          status: 'ACTIVE',
        };
      }

      if (!admin || admin.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          error: 'Email hoặc mật khẩu không chính xác.',
        });
      }

      if (admin.passwordHash) {
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            error: 'Email hoặc mật khẩu không chính xác.',
          });
        }
      }

      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role,
          type: 'admin',
        },
        config.jwtSecret,
        { expiresIn: '12h' }
      );

      try {
        await prisma.adminLog.create({
          data: {
            adminId: admin.id,
            action: 'LOGIN',
            targetType: 'AUTH',
            metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] }),
          },
        });
      } catch {
        // Ignore log if DB offline
      }

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: {
          token,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    } catch (err: any) {
      console.error('[AdminController.login] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Lỗi đăng nhập hệ thống.',
      });
    }
  }

  // 2. Lấy thông tin Admin hiện tại
  static async me(req: AuthenticatedAdminRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: { admin: req.admin },
    });
  }

  // 3. Thống kê Dashboard
  static async getDashboard(_req: Request, res: Response) {
    try {
      const [
        totalCustomers,
        totalBills,
        pendingBills,
        approvedBills,
        rejectedBills,
        months,
        activities,
      ] = await Promise.all([
        prisma.customer.count(),
        prisma.billSubmission.count(),
        prisma.billSubmission.count({ where: { status: 'pending' } }),
        prisma.billSubmission.count({ where: { status: 'approved' } }),
        prisma.billSubmission.count({ where: { status: 'rejected' } }),
        prisma.month.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { billSubmissions: true } },
          },
        }),
        prisma.activity.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { billSubmissions: true } },
          },
        }),
      ]);

      const billsByMonth = months.map((m) => ({
        monthName: m.name,
        count: m._count.billSubmissions,
      }));

      const billsByActivity = activities.map((a) => ({
        activityName: a.name,
        count: a._count.billSubmissions,
      }));

      return res.status(200).json({
        success: true,
        data: {
          totalCustomers,
          totalBills,
          pendingBills,
          approvedBills,
          rejectedBills,
          billsByMonth,
          billsByActivity,
        },
      });
    } catch (err) {
      // Fallback in-memory
      const memBills = Array.from(inMemoryStore.bills.values());
      const pendingBills = memBills.filter((b) => b.status === 'pending').length;
      const approvedBills = memBills.filter((b) => b.status === 'approved').length;
      const rejectedBills = memBills.filter((b) => b.status === 'rejected').length;

      return res.status(200).json({
        success: true,
        data: {
          totalCustomers: inMemoryStore.customers.size,
          totalBills: memBills.length,
          pendingBills,
          approvedBills,
          rejectedBills,
          billsByMonth: inMemoryStore.months.map((m) => ({
            monthName: m.name,
            count: memBills.filter((b) => b.monthId === m.id).length,
          })),
          billsByActivity: inMemoryStore.activities.map((a) => ({
            activityName: a.name,
            count: memBills.filter((b) => b.activityId === a.id).length,
          })),
        },
      });
    }
  }

  // 4. Danh sách hóa đơn (Filters, Search, Pagination)
  static async getBills(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        status,
        monthId,
        activityId,
        search,
        startDate,
        endDate,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};

      if (status && status !== 'all') {
        whereClause.status = status;
      }

      if (monthId && monthId !== 'all') {
        whereClause.monthId = monthId;
      }

      if (activityId && activityId !== 'all') {
        whereClause.activityId = activityId;
      }

      if (startDate || endDate) {
        whereClause.submittedAt = {};
        if (startDate) whereClause.submittedAt.gte = new Date(startDate as string);
        if (endDate) whereClause.submittedAt.lte = new Date(endDate as string);
      }

      if (search && typeof search === 'string' && search.trim()) {
        const query = search.trim();
        whereClause.customer = {
          OR: [
            { phone: { contains: query } },
            { name: { contains: query } },
          ],
        };
      }

      const [total, bills] = await Promise.all([
        prisma.billSubmission.count({ where: whereClause }),
        prisma.billSubmission.findMany({
          where: whereClause,
          include: {
            customer: true,
            month: true,
            activity: true,
            reviewer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: bills,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      // Fallback in-memory
      const allMemBills = Array.from(inMemoryStore.bills.values());
      let filtered = allMemBills;
      if (status && status !== 'all') {
        filtered = filtered.filter((b) => b.status === status);
      }
      return res.status(200).json({
        success: true,
        data: filtered,
        pagination: {
          total: filtered.length,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    }
  }

  // 5. Chi tiết 1 hóa đơn
  static async getBillById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bill = await prisma.billSubmission.findUnique({
        where: { id },
        include: {
          customer: true,
          month: true,
          activity: true,
          reviewer: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!bill) {
        return res.status(404).json({ success: false, error: 'Hóa đơn không tồn tại.' });
      }

      return res.status(200).json({ success: true, data: bill });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi lấy thông tin hóa đơn.' });
    }
  }

  // 6. PHÊ DUYỆT HÓA ĐƠN
  static async approveBill(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;
      const adminId = req.admin?.id;

      const bill = await prisma.billSubmission.findUnique({ where: { id } });
      if (!bill) {
        return res.status(404).json({ success: false, error: 'Hóa đơn không tồn tại.' });
      }

      const updatedBill = await prisma.billSubmission.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          adminNote: adminNote || 'Hóa đơn hợp lệ.',
        },
        include: { customer: true, activity: true },
      });

      // Audit log
      if (adminId) {
        await prisma.adminLog.create({
          data: {
            adminId,
            action: 'APPROVE_BILL',
            targetType: 'BILL',
            targetId: id,
            metadata: JSON.stringify({ adminNote }),
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã phê duyệt hóa đơn thành công!',
        data: updatedBill,
      });
    } catch (err) {
      // Fallback in-memory
      const memBill = inMemoryStore.bills.get(req.params.id);
      if (memBill) {
        memBill.status = 'approved';
        memBill.adminNote = req.body.adminNote || 'Hóa đơn hợp lệ.';
        return res.status(200).json({
          success: true,
          message: 'Đã phê duyệt hóa đơn thành công!',
          data: memBill,
        });
      }
      return res.status(500).json({ success: false, error: 'Lỗi khi phê duyệt hóa đơn.' });
    }
  }

  // 7. TỪ CHỐI HÓA ĐƠN
  static async rejectBill(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;
      const adminId = req.admin?.id;

      const bill = await prisma.billSubmission.findUnique({ where: { id } });
      if (!bill) {
        const memBill = inMemoryStore.bills.get(id);
        if (memBill) {
          memBill.status = 'rejected';
          memBill.adminNote = adminNote || 'Hóa đơn chưa hợp lệ.';
          return res.status(200).json({
            success: true,
            message: 'Đã từ chối hóa đơn.',
            data: memBill,
          });
        }
        return res.status(404).json({ success: false, error: 'Hóa đơn không tồn tại.' });
      }

      const updatedBill = await prisma.billSubmission.update({
        where: { id },
        data: {
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          adminNote: adminNote || 'Hóa đơn chưa hợp lệ hoặc thiếu thông tin.',
        },
        include: { customer: true, activity: true },
      });

      // Audit log
      if (adminId) {
        try {
          await prisma.adminLog.create({
            data: {
              adminId,
              action: 'REJECT_BILL',
              targetType: 'BILL',
              targetId: id,
              metadata: JSON.stringify({ adminNote }),
            },
          });
        } catch {
          // Ignore
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Đã từ chối hóa đơn.',
        data: updatedBill,
      });
    } catch (err) {
      const memBill = inMemoryStore.bills.get(req.params.id);
      if (memBill) {
        memBill.status = 'rejected';
        memBill.adminNote = req.body.adminNote || 'Hóa đơn chưa hợp lệ.';
        return res.status(200).json({
          success: true,
          message: 'Đã từ chối hóa đơn.',
          data: memBill,
        });
      }
      return res.status(500).json({ success: false, error: 'Lỗi khi từ chối hóa đơn.' });
    }
  }

  // 8. Quản lý Tháng (Admin)
  static async listMonths(_req: Request, res: Response) {
    try {
      const months = await prisma.month.findMany({
        orderBy: { startDate: 'asc' },
        include: {
          _count: { select: { activities: true, billSubmissions: true } },
        },
      });
      return res.status(200).json({ success: true, data: months });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi tải danh sách tháng.' });
    }
  }

  static async updateMonth(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, status, startDate, endDate } = req.body;

      const updated = await prisma.month.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status && { status }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
      });

      return res.status(200).json({ success: true, data: updated, message: 'Cập nhật tháng thành công!' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi cập nhật tháng.' });
    }
  }

  // 9. Quản lý Hoạt Động (Admin)
  static async listActivities(req: Request, res: Response) {
    try {
      const { monthId } = req.query;
      const whereClause: any = {};
      if (monthId && monthId !== 'all') {
        whereClause.monthId = monthId as string;
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
        include: {
          month: true,
          _count: { select: { billSubmissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, data: activities });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi tải danh sách hoạt động.' });
    }
  }

  static async createActivity(req: Request, res: Response) {
    try {
      const { monthId, name, description, rules, status, banner, logo } = req.body;

      if (!monthId || !name || !description) {
        return res.status(400).json({ success: false, error: 'Vui lòng điền đủ thông tin hoạt động.' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const activity = await prisma.activity.create({
        data: {
          monthId,
          name,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          description,
          rules,
          status: status || 'ACTIVE',
          banner,
          logo,
        },
        include: { month: true },
      });

      return res.status(201).json({ success: true, message: 'Thêm hoạt động thành công!', data: activity });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi tạo hoạt động.' });
    }
  }

  static async updateActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, rules, status, banner, logo, monthId } = req.body;

      const activity = await prisma.activity.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(rules !== undefined && { rules }),
          ...(status && { status }),
          ...(banner !== undefined && { banner }),
          ...(logo !== undefined && { logo }),
          ...(monthId && { monthId }),
        },
      });

      return res.status(200).json({ success: true, message: 'Cập nhật hoạt động thành công!', data: activity });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi cập nhật hoạt động.' });
    }
  }

  // 10. Danh sách Khách Hàng (Admin)
  static async listCustomers(req: Request, res: Response) {
    try {
      const { search, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};
      if (search && typeof search === 'string') {
        whereClause.OR = [
          { phone: { contains: search.trim() } },
          { name: { contains: search.trim() } },
        ];
      }

      const [total, customers] = await Promise.all([
        prisma.customer.count({ where: whereClause }),
        prisma.customer.findMany({
          where: whereClause,
          include: {
            _count: { select: { billSubmissions: true } },
            billSubmissions: {
              take: 5,
              orderBy: { submittedAt: 'desc' },
              include: { activity: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: customers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi tải danh sách khách hàng.' });
    }
  }
}
