import React from 'react';
import { XCircle, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';

interface ResultRejectedScreenProps {
  billData: any;
  onRetry: () => void;
  onOpenRules: () => void;
}

export const ResultRejectedScreen: React.FC<ResultRejectedScreenProps> = ({
  billData,
  onRetry,
  onOpenRules,
}) => {
  const adminNote = billData?.adminNote || 'Hóa đơn không rõ ngày giờ, bị mờ hoặc không đạt giá trị theo thể lệ.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title="Thông Báo Kết Quả" />

        <div className="p-4 space-y-6 pt-4">
          {/* Main Alert Card */}
          <div className="rounded-3xl bg-white p-6 text-center shadow-card border border-red-100 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-gray-900 leading-tight">
                Hóa Đơn Quý Khách Chưa Hợp Lệ
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Vui lòng xem lại thể lệ hoặc liên hệ với nhân viên PG tại quầy để được hỗ trợ.
              </p>
            </div>

            {/* Lý do từ admin note */}
            <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200/80 text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Lý do chưa hợp lệ:</span>
              </div>
              <p className="text-xs text-red-900 leading-relaxed font-medium">
                {adminNote}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Nút THỂ LỆ theo brief */}
            <button
              onClick={onOpenRules}
              className="w-full py-3.5 bg-white border-2 border-aeon-primary text-aeon-primary font-bold rounded-2xl flex items-center justify-center space-x-2 btn-active-scale transition-all hover:bg-rose-50"
            >
              <BookOpen className="w-4 h-4" />
              <span>XEM LẠI THỂ LỆ CHƯƠNG TRÌNH</span>
            </button>

            {/* Nút Gửi lại hóa đơn */}
            <button
              onClick={onRetry}
              className="w-full py-4 bg-gradient-to-r from-aeon-primary to-aeon-dark hover:opacity-95 text-white font-bold rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chụp / Gửi Lại Hóa Đơn Khác</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        <p className="text-[11px] text-gray-400">
          Đội ngũ PG AEON Hải Dương luôn sẵn sàng hỗ trợ quý khách tại booth sự kiện!
        </p>
      </div>
    </div>
  );
};
