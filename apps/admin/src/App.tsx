import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './context/AdminAuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar, AdminTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { BillsPage } from './pages/BillsPage';
import { MonthsPage } from './pages/MonthsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';
import { adminApi } from './api/client';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Tự động chuyển về dashboard nếu tab hiện tại là tháng hoặc hoạt động đang tạm ẩn
  useEffect(() => {
    if (activeTab === 'months' || activeTab === 'activities') {
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  // Thăm dò số lượng bill chờ duyệt để hiển thị badge đỏ
  useEffect(() => {
    if (isAuthenticated) {
      updatePendingBadge();
      const interval = setInterval(updatePendingBadge, 10000); // 10 giây một lần
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const updatePendingBadge = async () => {
    try {
      const res = await adminApi.getDashboard();
      if (res.data?.pendingBills !== undefined) {
        setPendingCount(res.data.pendingBills);
      }
    } catch {
      // Bỏ qua lỗi
    }
  };

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    await updatePendingBadge();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        Đang khởi động hệ thống quản trị AEON...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tổng Quan Báo Cáo';
      case 'bills':
        return 'Quản Lý & Phê Duyệt Hóa Đơn';
      case 'months':
        return 'Quản Lý Tháng & Trạng Thái';
      case 'activities':
        return 'Quản Lý Workshop & Hoạt Động';
      case 'customers':
        return 'Danh Sách Khách Hàng';
      case 'settings':
        return 'Cài Đặt Thể Lệ Chương Trình';
      default:
        return 'Cổng Quản Trị AEON';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Desktop */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={getPageTitle()}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage onNavigateToBills={() => setActiveTab('bills')} />
          )}
          {activeTab === 'bills' && <BillsPage />}
          {activeTab === 'months' && <MonthsPage />}
          {activeTab === 'activities' && <ActivitiesPage />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};
