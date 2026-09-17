import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AeonLogo } from './AeonLogo';

interface HeaderProps {
  onOpenRules: () => void;
  title?: string;
  showUserInfo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRules, title, showUserInfo = true }) => {
  const { customer, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo AEON & Title */}
        <div className="flex items-center space-x-2.5">
          <AeonLogo className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-800 leading-none">
              {title || 'Chương Trình Đổi Quà'}
            </span>
          </div>
        </div>

        {/* Nút THỂ LỆ & Tài khoản */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-aeon-primary rounded-full text-xs font-semibold border border-rose-200/80 transition-colors btn-active-scale"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>THỂ LỆ</span>
          </button>

          {showUserInfo && isAuthenticated && customer && (
            <button
              onClick={() => {
                if (confirm('Bạn có muốn đăng xuất khỏi tài khoản này?')) {
                  logout();
                }
              }}
              title="Đăng xuất"
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
