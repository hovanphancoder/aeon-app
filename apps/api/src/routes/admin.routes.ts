import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { SettingsController } from '../controllers/settings.controller';
import { adminAuth, requireSuperAdmin } from '../middleware/auth.middleware';
import { adminLoginLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// 1. Auth Admin
router.post('/auth/login', adminLoginLimiter, AdminController.login);
router.get('/auth/me', adminAuth, AdminController.me);

// 2. Dashboard
router.get('/dashboard', adminAuth, AdminController.getDashboard);

// 3. Quản lý Hóa Đơn & Phê Duyệt
router.get('/bills', adminAuth, AdminController.getBills);
router.get('/bills/:id', adminAuth, AdminController.getBillById);
router.post('/bills/:id/approve', adminAuth, AdminController.approveBill);
router.post('/bills/:id/reject', adminAuth, AdminController.rejectBill);

// 4. Quản lý Tháng
router.get('/months', adminAuth, AdminController.listMonths);
router.put('/months/:id', adminAuth, AdminController.updateMonth);

// 5. Quản lý Hoạt Động
router.get('/activities', adminAuth, AdminController.listActivities);
router.post('/activities', adminAuth, AdminController.createActivity);
router.put('/activities/:id', adminAuth, AdminController.updateActivity);

// 6. Quản lý Khách Hàng
router.get('/customers', adminAuth, AdminController.listCustomers);

// 7. Quản lý Cài Đặt & Thể Lệ
router.get('/settings/rules', adminAuth, SettingsController.getRules);
router.put('/settings/rules', adminAuth, requireSuperAdmin, SettingsController.updateRules);

export default router;
