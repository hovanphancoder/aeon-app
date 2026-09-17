// API Client linh hoạt cho Customer Web
// Tự động chuẩn hóa VITE_API_URL để tránh bị lặp '/api/api' hoặc thiếu '/api'
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) 
  : '/api';

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('aeon_customer_token');

  const headers = new Headers(options.headers || {});
  
  // Tự động gắn token nếu có
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Nếu không phải FormData thì mặc định Content-Type là application/json
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      if (response.status === 500 || response.status === 502 || response.status === 504) {
        throw new ApiError(
          'Chưa kết nối được Backend API (Cổng 3000). Vui lòng mở thêm 1 cửa sổ Terminal và chạy: npm run dev:api',
          response.status
        );
      }
    }

    if (!response.ok) {
      const errMsg = data.error || data.message || (
        response.status === 404 
          ? 'Endpoint API không tồn tại (404)' 
          : 'Chưa kết nối được Backend API (Cổng 3000). Vui lòng kiểm tra lệnh: npm run dev:api'
      );
      throw new ApiError(errMsg, response.status, data);
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Không thể kết nối tới Backend API. Vui lòng kiểm tra đã chạy: npm run dev:api');
  }
}

export const api = {
  // 1. Auth & OTP
  requestOtp: (phone: string, name: string) => 
    request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    }),

  verifyOtp: (phone: string, otp: string, name: string) => 
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    }),

  getMe: () => request('/auth/me'),

  logout: () => 
    request('/auth/logout', {
      method: 'POST',
    }),

  // 2. Months & Activities
  getMonths: () => request('/months'),

  getMonthById: (id: string) => request(`/months/${id}`),

  getActivities: (monthId?: string) => 
    request(`/activities${monthId ? `?monthId=${monthId}` : ''}`),

  getActivityById: (id: string) => request(`/activities/${id}`),

  // 3. Bill Submissions
  submitBill: (activityId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('activityId', activityId);
    formData.append('billImage', imageFile);

    return request('/bills', {
      method: 'POST',
      body: formData,
    });
  },

  getBillStatus: (billId: string) => request(`/bills/${billId}`),

  getMyBills: () => request('/bills/my'),

  // 4. Thể Lệ
  getRules: () => request('/settings/rules'),
};
