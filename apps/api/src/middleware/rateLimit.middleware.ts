import rateLimit from 'express-rate-limit';

// Giới hạn yêu cầu gửi OTP: tối đa 5 lần mỗi 10 phút từ 1 IP
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Quý khách đã gửi yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 10 phút.',
  },
});

// Giới hạn nộp hóa đơn: tối đa 10 lần mỗi 10 phút
export const billSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Quý khách đã gửi hóa đơn liên tục. Vui lòng chờ ít phút để thử lại.',
  },
});

// Giới hạn đăng nhập Admin: tối đa 10 lần sai mỗi 15 phút
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Quá nhiều lần thử đăng nhập thất bại. Vui lòng quay lại sau 15 phút.',
  },
});
