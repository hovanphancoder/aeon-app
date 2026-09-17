import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';

interface ResultRejectedScreenProps {
  billData: any;
  activity?: ActivityItem | null;
  onRetry: () => void;
  onHome: () => void;
  onOpenRules: () => void;
  onBack?: () => void;
}

export const ResultRejectedScreen: React.FC<ResultRejectedScreenProps> = ({
  billData,
  activity,
  onRetry,
  onOpenRules,
  onBack,
}) => {
  const formatTitle = (name?: string) => {
    const raw = name || activity?.name || billData?.activity?.name || 'NAIL XINH TẶNG NÀNG';
    const parts = raw.trim().split(' ');
    if (parts.length <= 2) return [raw.toUpperCase()];
    const mid = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, mid).join(' ').toUpperCase(),
      parts.slice(mid).join(' ').toUpperCase(),
    ];
  };

  const titleLines = formatTitle(activity?.name || billData?.activity?.name || 'NAIL XINH TẶNG NÀNG');

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent px-5 py-4 pb-8">
      {/* Top Section: Header & Tiêu đề hoạt động */}
      <div className="space-y-2">
        {/* Row 1: Back arrow + LOGO Badge */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack || onRetry}
            className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" /> {/* Cân đối */}
        </div>

        {/* Row 2: Tên hoạt động & Thời gian chương trình chuẩn ảnh mẫu 3 */}
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

      {/* Center Content: TỜ GIẤY THÔNG BÁO HOÁ ĐƠN CHƯA HỢP LỆ VỚI KẸP GẮP VÀNG */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-4 w-full max-w-[340px] mx-auto">
        <div className="relative w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-100 p-5 pt-7 pb-6 transition-transform">
          {/* Biểu tượng Kẹp giấy Kim Loại Vàng (Golden Paperclip) ở góc trên bên phải */}
          <div className="absolute -top-3 right-5 z-20 pointer-events-none drop-shadow-md">
            <svg
              className="w-8 h-10 text-[#D4AF37] rotate-[22deg]"
              viewBox="0 0 24 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Paperclip path */}
              <path d="M7 11V26a5 5 0 0 0 10 0V8a7 7 0 0 0-14 0v18a9 9 0 0 0 18 0V11" />
            </svg>
          </div>

          {/* Banner thông báo "HOÁ ĐƠN CHƯA HỢP LỆ!" chuẩn mẫu 3 */}
          <div className="mb-4">
            <div className="inline-block bg-pink-100/90 text-[#D80032] font-black text-lg sm:text-xl px-5 py-2 rounded-2xl border border-pink-200/60 shadow-sm leading-tight tracking-wide">
              HOÁ ĐƠN<br />CHƯA HỢP LỆ!
            </div>
          </div>

          {/* Đoạn văn bản hướng dẫn khách hàng */}
          <p className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed max-w-[270px] mx-auto">
            Quý khách vui lòng kiểm tra lại thể lệ chương trình hoặc liên hệ nhân viên tại khu vực sự kiện để được hỗ trợ.
          </p>

          {/* Ghi chú chi tiết từ Admin (nếu có) */}
          {billData?.adminNote && billData.adminNote !== 'Hóa đơn chưa hợp lệ.' && (
            <div className="mt-3.5 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 text-left">
              <span className="font-bold">Lý do từ PG:</span> {billData.adminNote}
            </div>
          )}

          {/* Nút bấm chụp lại hóa đơn */}
          <div className="mt-5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-2 bg-gradient-to-b from-[#FF2D78] via-[#E60067] to-[#C00054] text-white font-black text-xs rounded-full shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>CHỤP LẠI HÓA ĐƠN KHÁC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Nút THỂ LỆ Màu Xanh Lá Cây Viên Thuốc Chuẩn Mẫu 3 */}
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
