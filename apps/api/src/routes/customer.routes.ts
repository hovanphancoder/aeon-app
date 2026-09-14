import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { MonthController } from '../controllers/month.controller';
import { ActivityController } from '../controllers/activity.controller';
import { BillController } from '../controllers/bill.controller';
import { SettingsController } from '../controllers/settings.controller';
import { customerAuth } from '../middleware/auth.middleware';
import { uploadBillMiddleware, handleUploadErrors } from '../middleware/upload.middleware';
import { otpRateLimiter, billSubmissionLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// 1. Xác thực & Session
router.post('/auth/request-otp', otpRateLimiter, AuthController.requestOtp);
router.post('/auth/verify-otp', AuthController.verifyOtp);
router.get('/auth/me', customerAuth, AuthController.me);
router.post('/auth/logout', customerAuth, AuthController.logout);

// 2. Tháng & Hoạt động
router.get('/months', MonthController.getMonths);
router.get('/months/:id', MonthController.getMonthById);
router.get('/activities', ActivityController.getActivities);
router.get('/activities/:id', ActivityController.getActivityById);

// 3. Upload & Kiểm tra Hóa đơn
router.post('/bills', customerAuth, billSubmissionLimiter, uploadBillMiddleware, handleUploadErrors, BillController.submitBill);
router.get('/bills/my', customerAuth, BillController.getMyBills);
router.get('/bills/:id', customerAuth, BillController.getBillStatus);

// 4. Thể Lệ & Cài đặt chung
router.get('/settings/rules', SettingsController.getRules);

export default router;
