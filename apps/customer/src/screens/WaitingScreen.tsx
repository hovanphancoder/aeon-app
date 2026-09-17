import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';
import cuteCatMascotImg from '../assets/cute_cat_mascot.png';

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
    const raw = name || activity?.name || 'NAIL XINH TẶNG NÀNG';
    const parts = raw.trim().split(' ');
    if (parts.length <= 2) return [raw.toUpperCase()];
    const mid = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, mid).join(' ').toUpperCase(),
      parts.slice(mid).join(' ').toUpperCase(),
    ];
  };

  const titleLines = formatTitle(activity?.name || 'NAIL XINH TẶNG NÀNG');

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent px-5 py-4 pb-8">
      {/* Top Section: Header & Tiêu đề hoạt động */}
      <div className="space-y-2">
        {/* Row 1: Back arrow + LOGO Badge */}
        <div className="flex items-center justify-between pt-1">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" /> {/* Cân đối */}
        </div>

        {/* Row 2: Tên hoạt động & Thời gian chương trình chuẩn ảnh mẫu 2 */}
        <div className="text-center pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#E60067] tracking-wider uppercase leading-tight">
            {titleLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </h1>

          {/* Sub-badge thời gian vàng nghệ */}
          <div className="inline-block bg-[#FFE600] text-[#002D5A] font-extrabold text-[9px] sm:text-[10px] px-3.5 py-0.5 rounded-full border border-amber-300 shadow-sm uppercase tracking-wide mt-1">
            THỜI GIAN CHƯƠNG TRÌNH: 18 - 20.10.2026
          </div>
        </div>
      </div>

      {/* Center Content: VUI LÒNG CHỜ ADMIN TRONG GIÂY LÁT + MÈO THIÊN THẦN + DẤU CHẤM LOADING */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-4 space-y-4">
        <h2 className="text-base sm:text-lg font-black text-[#E60067] uppercase tracking-wide leading-tight max-w-[260px] mx-auto">
          VUI LÒNG CHỜ ADMIN<br />TRONG GIÂY LÁT
        </h2>

        {/* Linh vật bé mèo trắng thiên thần dễ thương */}
        <div className="relative w-44 sm:w-48 max-w-[210px] flex items-center justify-center py-1">
          <img
            src={cuteCatMascotImg}
            alt="Vui lòng chờ Admin duyệt"
            className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none"
          />
        </div>

        {/* Thanh dấu chấm nhấp nháy chuyển động chuẩn mẫu 2 */}
        <div className="px-5 py-2 bg-white/95 backdrop-blur-sm rounded-full border border-pink-200/80 shadow-sm flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:-0.35s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:-0.2s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:-0.1s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:0s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:0.1s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:0.2s]" />
          <span className="w-2 h-2 rounded-full bg-[#E60067] animate-bounce [animation-delay:0.35s]" />
        </div>
      </div>

      {/* Bottom Section: Nút THỂ LỆ Màu Xanh Lá Cây Viên Thuốc Chuẩn Mẫu 2 */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onOpenRules}
          className="px-12 py-1.5 bg-gradient-to-b from-[#8CD825] via-[#70C922] to-[#4F9E13] hover:brightness-105 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-md border border-white/60 tracking-wider uppercase transition-all"
        >
          THỂ LỆ
        </button>
      </div>
    </div>
  );
};
