import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-rose-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-aeon-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-medium text-gray-500 animate-pulse-subtle">{text}</p>
    </div>
  );
};
