import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api/client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, adminData: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('aeon_admin_token');
    const savedAdmin = localStorage.getItem('aeon_admin_data');

    if (!token) {
      setIsLoading(false);
      return;
    }

    adminApi
      .getMe()
      .then((res) => {
        if (res.data?.admin) {
          setAdmin(res.data.admin);
        } else if (savedAdmin) {
          setAdmin(JSON.parse(savedAdmin));
        }
      })
      .catch(() => {
        localStorage.removeItem('aeon_admin_token');
        localStorage.removeItem('aeon_admin_data');
        setAdmin(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (token: string, adminData: AdminUser) => {
    localStorage.setItem('aeon_admin_token', token);
    localStorage.setItem('aeon_admin_data', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('aeon_admin_token');
    localStorage.removeItem('aeon_admin_data');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
