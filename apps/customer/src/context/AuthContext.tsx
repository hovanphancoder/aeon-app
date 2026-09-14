import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, customerData: CustomerUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo: Kiểm tra session 24h từ Token
  useEffect(() => {
    async function checkExistingSession() {
      const savedToken = localStorage.getItem('aeon_customer_token');
      const savedCustomer = localStorage.getItem('aeon_customer_data');

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Gọi API /auth/me để xác thực token và session còn hạn hay không
        const response = await api.getMe();
        if (response && response.data?.customer) {
          setCustomer(response.data.customer);
        } else if (savedCustomer) {
          setCustomer(JSON.parse(savedCustomer));
        }
      } catch (err) {
        console.warn('Session hết hạn hoặc không hợp lệ, xóa token.');
        localStorage.removeItem('aeon_customer_token');
        localStorage.removeItem('aeon_customer_data');
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingSession();
  }, []);

  const login = (token: string, customerData: CustomerUser) => {
    localStorage.setItem('aeon_customer_token', token);
    localStorage.setItem('aeon_customer_data', JSON.stringify(customerData));
    setCustomer(customerData);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Bỏ qua lỗi khi logout
    }
    localStorage.removeItem('aeon_customer_token');
    localStorage.removeItem('aeon_customer_data');
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
