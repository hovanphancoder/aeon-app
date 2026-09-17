import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';
import nailBoxGiftImg from '../assets/nail_box_gift.jpg';

interface ResultApprovedScreenProps {
  billData: any;
  activity?: ActivityItem | null;
  onContinueAnother: () => void;
  onHome: () => void;
  onOpenRules: () => void;
  onBack?: () => void;
}

export const ResultApprovedScreen: React.FC<ResultApprovedScreenProps> = ({
  billData: _billData,
  activity: _activity,
  onContinueAnother,
  onHome: _onHome,
  onOpenRules: _onOpenRules,
  onBack,
}) => {
  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent px-5 py-4 pb-4">
      {/* Top Header Section */}
      <div className="space-y-1">
        {/* Row 1: Back arrow + LOGO AEON Hải Dương */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack || onContinueAnother}
            className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" /> {/* Cân đối */}
        </div>

        {/* Row 2: Tiêu đề 3D "CHÚC MỪNG" rực rỡ với ruy băng chúc mừng */}
        <div className="relative text-center pt-2">
          {/* Ruy băng tím và nốt nhạc trang trí hai bên */}
          <div className="absolute left-4 top-2 text-[#E60067] text-lg select-none pointer-events-none animate-pulse">
            <svg className="w-6 h-6 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" opacity="0" />
              <path d="M6 3c2 2 1 6 3 8s5 1 4 4" stroke="#E60067" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute right-4 top-2 text-amber-400 text-lg select-none pointer-events-none animate-bounce">
            ♪
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider leading-none"
            style={{
              background: 'linear-gradient(180deg, #FFF066 0%, #FF9900 45%, #E60026 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter:
                'drop-shadow(0 1.5px 0 #FFFFFF) drop-shadow(0 3px 0 #9E0018) drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
            }}
          >
            CHÚC MỪNG
          </h1>
        </div>
      </div>

      {/* Dải Banner ruy băng Vàng: BẠN CÓ 1 LƯỢT THAM GIA WORKSHOP & NHẬN NGAY NAIL BOX */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-2 space-y-3 pt-1">
        <div className="w-full max-w-[340px] relative">
          <div
            className="w-full py-2 px-3 rounded-2xl shadow-lg border border-amber-300 text-center leading-tight"
            style={{
              background: 'linear-gradient(90deg, #FFAE00 0%, #FFC72C 50%, #FFAE00 100%)',
            }}
          >
            <p
              className="text-xs sm:text-[13px] font-black uppercase tracking-wide"
              style={{
                color: '#FFFFFF',
                textShadow: '0 1.5px 2px #A83800, 0 1px 1px #702600',
              }}
            >
              BẠN CÓ 1 LƯỢT THAM GIA WORKSHOP<br />& NHẬN NGAY NAIL BOX
            </p>
          </div>
        </div>

        {/* Khung ảnh NAIL BOX quà tặng bo viền hồng chuẩn mẫu 4 */}
        <div className="w-[88%] max-w-[290px] h-[300px] sm:h-[320px] border-2 border-[#E60067] rounded-3xl bg-white p-2 relative flex flex-col items-center justify-center overflow-hidden shadow-md">
          <img
            src={nailBoxGiftImg}
            alt="Quà tặng Nail Box"
            className="w-full h-full object-cover rounded-2xl select-none pointer-events-none"
          />
        </div>

        {/* Nút bấm QUAY VỀ TRANG HOẠT ĐỘNG chuẩn mẫu 4 */}
        <div className="w-[88%] max-w-[290px] pt-1">
          <button
            type="button"
            onClick={onContinueAnother}
            className="w-full py-2 bg-gradient-to-b from-[#FF2D78] via-[#E60067] to-[#C00054] hover:brightness-105 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-lg border-2 border-white/60 tracking-wider uppercase transition-all"
          >
            QUAY VỀ TRANG HOẠT ĐỘNG
          </button>
        </div>

        {/* Dòng ghi chú nhỏ chuẩn mẫu 4 */}
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-800 text-center italic">
          *Hình ảnh chỉ mang tính chất minh họa
        </p>
      </div>
    </div>
  );
};
