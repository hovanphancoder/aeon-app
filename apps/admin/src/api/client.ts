// API Client cho Admin Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/admin` 
  : '/api/admin';

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('aeon_admin_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

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

export const adminApi = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request('/auth/me'),

  // Dashboard Stats
  getDashboard: () => request('/dashboard'),

  // Bill Management
  getBills: (params: {
    page?: number;
    limit?: number;
    status?: string;
    monthId?: string;
    activityId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val.toString());
      }
    });
    return request(`/bills?${query.toString()}`);
  },

  getBillById: (id: string) => request(`/bills/${id}`),

  approveBill: (id: string, adminNote?: string) =>
    request(`/bills/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }),

  rejectBill: (id: string, adminNote?: string) =>
    request(`/bills/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote }),
    }),

  // Months
  listMonths: () => request('/months'),
  updateMonth: (id: string, data: any) =>
    request(`/months/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Activities
  listActivities: (monthId?: string) =>
    request(`/activities${monthId ? `?monthId=${monthId}` : ''}`),

  createActivity: (data: any) =>
    request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActivity: (id: string, data: any) =>
    request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Customers
  listCustomers: (params: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    return request(`/customers?${query.toString()}`);
  },

  // Settings / Rules
  getRules: () => request('/settings/rules'),
  updateRules: (rules: string) =>
    request('/settings/rules', {
      method: 'PUT',
      body: JSON.stringify({ rules }),
    }),
};
