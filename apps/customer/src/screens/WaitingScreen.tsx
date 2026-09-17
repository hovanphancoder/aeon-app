import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';

interface WaitingScreenProps {
  billId: string;
  activity?: ActivityItem | null;
  onApproved: (billData: any) => void;
  onRejected: (billData: any) => void;
  onOpenRules: () => void;
  onBack?: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  billId,
  activity,
  onApproved,
  onRejected,
  onOpenRules,
  onBack,
}) => {
  useEffect(() => {
    let isMounted = true;

    // Polling trạng thái hóa đơn từ server mỗi 2.5 giây
    // CHỈ CHUYỂN TRẠNG THÁI KHI ADMIN DUYỆT HOẶC TỪ CHỐI THỰC TẾ
    const interval = setInterval(async () => {
      try {
        const res = await api.getBillStatus(billId);
        if (!isMounted || !res.data) return;

        const status = (res.data.status || '').toLowerCase();

        if (status === 'approved') {
          clearInterval(interval);
          onApproved(res.data);
        } else if (status === 'rejected') {
          clearInterval(interval);
          onRejected(res.data);
        }
      } catch (err) {
        // Tiếp tục chờ admin mà không tự động chuyển trạng thái
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [billId, onApproved, onRejected]);

  const formatTitle = (name?: string) => {
    const raw = name || activity?.name || 'Nét Điệu Cho Nàng';
    const parts = raw.trim().split(' ');
    if (parts.length <= 2) return [raw.toUpperCase()];
    const mid = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, mid).join(' ').toUpperCase(),
      parts.slice(mid).join(' ').toUpperCase(),
    ];
  };

  const titleLines = formatTitle(activity?.name);

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-6 pb-8">
      {/* Top Header Section */}
      <div className="space-y-4">
        {/* Row 1: Back arrow + LOGO Badge */}
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-gray-900 hover:text-black active:scale-95 transition-all"
              title="Quay lại"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-9 sm:h-11 w-auto object-contain" />

          <div className="w-10" /> {/* Cân đối */}
        </div>

        {/* Row 2: Tên hoạt động (Huy hiệu hồng, chữ đen bo góc) */}
        <div className="text-center pt-1">
          <div className="inline-block bg-[#FF4081] text-black font-black text-base sm:text-lg px-8 py-2 rounded-3xl shadow-sm border border-pink-400 leading-tight">
            {titleLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Content: VUI LÒNG CHỜ TRONG GIÂY LÁT */}
      <div className="my-auto text-center px-4 space-y-4">
        <h1 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide leading-tight">
          VUI LÒNG CHỜ TRONG GIÂY LÁT
        </h1>

        {/* Radar hiệu ứng đang chờ admin */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-[#005E8A] animate-ping" />
          <span className="font-semibold text-[11px] text-gray-600">
            Đang kết nối hệ thống duyệt quầy PG...
          </span>
        </div>
      </div>

      {/* Bottom Section: Nút THỂ LỆ (Pill xanh than) */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onOpenRules}
          className="px-14 py-2 bg-[#005E8A] hover:bg-[#004768] text-white font-extrabold text-sm rounded-full shadow-md active:scale-95 transition-all border border-sky-900/40"
        >
          thể lệ
        </button>
      </div>
    </div>
  );
};
