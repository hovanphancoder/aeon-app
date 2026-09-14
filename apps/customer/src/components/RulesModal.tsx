import React, { useEffect, useState } from 'react';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getRules()
        .then((res) => {
          setRules(res.data?.rules || 'Chưa có nội dung thể lệ.');
        })
        .catch(() => {
          setRules('Không thể tải thể lệ lúc này. Quý khách vui lòng liên hệ nhân viên PG tại quầy.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-aeon-primary to-aeon-dark text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">THỂ LỆ CHƯƠNG TRÌNH</h3>
              <p className="text-xs text-white/80">AEON Hải Dương Activation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-aeon-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Đang tải thể lệ mới nhất...</p>
            </div>
          ) : (
            <div className="whitespace-pre-line font-normal text-gray-800 space-y-2">
              {rules}
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-aeon-primary hover:bg-aeon-dark text-white font-semibold rounded-2xl shadow-aeon btn-active-scale transition-all"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
