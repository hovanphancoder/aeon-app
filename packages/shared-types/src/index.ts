// ========================================================
// SHARED TYPES - AEON BOOKING & ACTIVATION SYSTEM
// ========================================================

// ------------------------------------
// 1. ENUMS
// ------------------------------------
export type MonthStatus = 'ACTIVE' | 'COMING_SOON' | 'INACTIVE';
export type ActivityStatus = 'ACTIVE' | 'INACTIVE';
export type BillStatus = 'pending' | 'approved' | 'rejected';
export type AdminRole = 'super_admin' | 'admin';

// ------------------------------------
// 2. DOMAIN ENTITIES
// ------------------------------------

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSession {
  id: string;
  customerId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}

export interface Month {
  id: string;
  name: string;
  slug: string;
  status: MonthStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  monthId: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description: string;
  rules?: string | null;
  status: ActivityStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  month?: Month;
}

export interface BillSubmission {
  id: string;
  customerId: string;
  monthId: string;
  activityId: string;
  phone: string;
  customerName: string;
  billImage: string;
  status: BillStatus;
  adminNote?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  customer?: Customer;
  month?: Month;
  activity?: Activity;
  reviewer?: AdminUser;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  admin?: AdminUser;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

// ------------------------------------
// 3. API REQUEST & RESPONSE DTOs
// ------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth Customer
export interface RequestOtpDto {
  phone: string;
  name: string;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
}

export interface AuthCustomerResponse {
  token: string;
  expiresIn: string;
  customer: Customer;
}

// Auth Admin
export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AuthAdminResponse {
  token: string;
  admin: AdminUser;
}

// Bill Submission
export interface CreateBillDto {
  activityId: string;
  monthId?: string;
}

export interface ReviewBillDto {
  adminNote?: string;
}

// Admin Dashboard Stats
export interface DashboardStats {
  totalCustomers: number;
  totalBills: number;
  pendingBills: number;
  approvedBills: number;
  rejectedBills: number;
  billsByMonth: {
    monthName: string;
    count: number;
  }[];
  billsByActivity: {
    activityName: string;
    count: number;
  }[];
}
