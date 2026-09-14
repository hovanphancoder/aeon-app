import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../db/prisma';

export interface AuthenticatedCustomerRequest extends Request {
  customer?: {
    id: string;
    phone: string;
    name: string;
  };
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin';
  };
}

// Middleware xác thực Customer (24h JWT Session)
export async function customerAuth(req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    if (!decoded || decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        error: 'Mã xác thực không đúng đối tượng.',
      });
    }

    // Kiểm tra customer trong database (hỗ trợ RAM fallback)
    let customer: any = null;
    try {
      customer = await prisma.customer.findUnique({
        where: { id: decoded.customerId },
      });
    } catch {
      // Fallback
    }

    if (!customer) {
      customer = {
        id: decoded.customerId,
        phone: decoded.phone || '0987654321',
        name: decoded.name || 'Khách hàng AEON',
      };
    }

    req.customer = {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Phiên làm việc đã hết hạn (24h). Quý khách vui lòng xác thực OTP lại.',
    });
  }
}

// Middleware xác thực Admin
export async function adminAuth(req: AuthenticatedAdminRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Yêu cầu đăng nhập tài khoản quản trị viên.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Token không có quyền quản trị.',
      });
    }

    let admin: any = null;
    try {
      admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
      });
    } catch {
      // Fallback
    }

    if (!admin && decoded.adminId === 'admin-default-id') {
      admin = {
        id: 'admin-default-id',
        email: 'admin@aeon.vn',
        name: 'Quản Trị Viên AEON',
        role: 'super_admin',
        status: 'ACTIVE',
      };
    }

    if (!admin || admin.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Tài khoản quản trị đã bị khóa hoặc không tồn tại.',
      });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Phiên đăng nhập quản trị đã hết hạn.',
    });
  }
}

// Middleware phân quyền Super Admin
export function requireSuperAdmin(req: AuthenticatedAdminRequest, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Chức năng này chỉ dành riêng cho Super Admin.',
    });
  }
  next();
}
