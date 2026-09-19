import React from 'react';
import { LayoutDashboard, Receipt, Calendar, Gift, Users, Settings, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export type AdminTab = 'dashboard' | 'bills' | 'months' | 'activities' | 'customers' | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 0,
}) => {
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { id: 'bills', label: 'Duyệt Hóa Đơn', icon: Receipt, badge: pendingCount },
    // Tạm thời ẩn chức năng Quản Lý Tháng và Quản Lý Hoạt Động theo yêu cầu
    // { id: 'months', label: 'Quản Lý Tháng', icon: Calendar },
    // { id: 'activities', label: 'Quản Lý Hoạt Động', icon: Gift },
    { id: 'customers', label: 'Khách Hàng', icon: Users },
    { id: 'settings', label: 'Cài Đặt Thể Lệ', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Logo & Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-aeon-primary text-white font-black text-xl px-2.5 py-1 rounded-xl shadow-md">
            AEON
          </div>
          <div>
            <h1 className="font-extrabold text-white text-sm tracking-wider">HẢI DƯƠNG</h1>
            <span className="text-[11px] text-slate-400 font-medium block uppercase tracking-wider">
              Hệ Thống Phê Duyệt
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-aeon-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-aeon-primary' : 'bg-red-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-aeon-primary flex items-center justify-center shrink-0 border border-slate-700">
              <Shield className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{admin?.email}</p>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin PG'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn đăng xuất khỏi trang quản trị?')) {
                logout();
              }
            }}
            title="Đăng xuất"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
