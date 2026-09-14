import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { Header } from '../components/Header';

interface WaitingScreenProps {
  billId: string;
  onApproved: (billData: any) => void;
  onRejected: (billData: any) => void;
  onOpenRules: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  billId,
  onApproved,
  onRejected,
  onOpenRules,
}) => {
  const [pollCount, setPollCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    // Polling kiểm tra trạng thái bill mỗi 3 giây
    const interval = setInterval(async () => {
      try {
        const res = await api.getBillStatus(billId);
        if (!isMounted) return;

        if (res.data) {
          const status = res.data.status;
          if (status === 'approved') {
            clearInterval(interval);
            onApproved(res.data);
          } else if (status === 'rejected') {
            clearInterval(interval);
            onRejected(res.data);
          }
        }
        setPollCount((prev) => prev + 1);
      } catch (err) {
        console.warn('Lỗi kiểm tra trạng thái bill:', err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [billId, onApproved, onRejected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title="Đang Kiểm Tra Hóa Đơn" />

        <div className="p-6 space-y-8 pt-10 text-center">
          {/* Animated Radar / Loading Pulse */}
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-rose-200 animate-ping opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-rose-300 animate-pulse opacity-40"></div>
            <div className="relative w-24 h-24 bg-gradient-to-tr from-aeon-primary to-rose-500 rounded-full flex items-center justify-center text-white shadow-aeon">
              <Clock className="w-12 h-12 animate-pulse-subtle" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              VUI LÒNG CHỜ TRONG GIÂY LÁT
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Ban tổ chức tại booth AEON Hải Dương đang tiến hành kiểm tra và xác nhận hóa đơn của bạn.
            </p>
          </div>

          {/* Thông tin hỗ trợ */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-rose-100 text-left space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-aeon-primary">
              <Sparkles className="w-4 h-4" />
              <span>Gợi ý cho bạn:</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Màn hình sẽ tự động cập nhật ngay khi nhân viên PG xác nhận. Bạn không cần tải lại trang.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Mã lượt nộp: #{billId.slice(0, 8)}</span>
              <span className="font-mono text-emerald-600 font-bold">● Đang kết nối trực tiếp</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        <button
          onClick={onOpenRules}
          className="text-xs text-aeon-primary font-bold hover:underline"
        >
          Xem Lại Thể Lệ Chương Trình
        </button>
      </div>
    </div>
  );
};
