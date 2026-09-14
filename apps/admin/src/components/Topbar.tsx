import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface TopbarProps {
  title: string;
  onRefresh?: () => void;
  onToggleSidebar?: () => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  onRefresh,
  onToggleSidebar,
  isRefreshing = false,
}) => {
  const { admin } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>
        )}

        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-gray-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-gray-500">Đang trực tuyến:</span>
          <span className="font-bold text-gray-800">{admin?.name}</span>
        </div>
      </div>
    </header>
  );
};
