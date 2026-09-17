import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';

interface ResultApprovedScreenProps {
  billData: any;
  activity?: ActivityItem | null;
  onContinueAnother: () => void;
  onHome: () => void;
  onOpenRules: () => void;
  onBack?: () => void;
}

export const ResultApprovedScreen: React.FC<ResultApprovedScreenProps> = ({
  billData,
  activity,
  onContinueAnother,
  onHome,
  onOpenRules,
  onBack,
}) => {
  const formatTitle = (name?: string) => {
    const raw = name || activity?.name || billData?.activity?.name || 'Nét Điệu Cho Nàng';
    const parts = raw.trim().split(' ');
    if (parts.length <= 2) return [raw.toUpperCase()];
    const mid = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, mid).join(' ').toUpperCase(),
      parts.slice(mid).join(' ').toUpperCase(),
    ];
  };

  const titleLines = formatTitle(activity?.name || billData?.activity?.name);

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-6 pb-8">
      {/* Top Header Section */}
      <div className="space-y-4">
        {/* Row 1: Back arrow + LOGO Badge + Home icon */}
        <div className="flex items-center justify-between pt-2">
          {/* Nút quay lại */}
          <button
            type="button"
            onClick={onBack || onContinueAnother}
            className="w-10 h-10 flex items-center justify-center text-gray-900 hover:text-black active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-9 sm:h-11 w-auto object-contain" />

          {/* Nút Ngôi nhà (Home) trở về trang chủ theo bản vẽ */}
          <button
            type="button"
            onClick={onHome}
            className="w-10 h-10 flex items-center justify-center text-gray-900 hover:text-black active:scale-95 transition-all"
            title="Về trang chủ"
          >
            <Home className="w-7 h-7 stroke-[2.5] fill-black" />
          </button>
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

      {/* Center Content: CHÚC MỪNG - Bạn có 1 lượt tham gia workshop */}
      <div className="my-auto text-center px-4 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-wide">
          CHÚC MỪNG
        </h1>

        <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed max-w-[280px] mx-auto">
          <p>Bạn có 1 lượt tham gia</p>
          <p>workshop</p>
        </div>

        <div className="pt-3">
          <span className="inline-block px-4 py-1 bg-white/80 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-full shadow-sm">
            ✓ Đã được phê duyệt bởi PG
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
