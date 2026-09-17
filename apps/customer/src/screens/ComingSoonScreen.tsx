import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AeonLogo } from '../components/AeonLogo';

interface ComingSoonScreenProps {
  monthName: string;
  onBack: () => void;
  onOpenRules: () => void;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  monthName,
  onBack,
  onOpenRules: _onOpenRules,
}) => {
  const isMonth12 = monthName.includes('12');
  const titleColor = isMonth12 ? '#F58220' : '#009846';
  const shadowColor = isMonth12 ? '#B35400' : '#004D26';

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent px-5 py-4 pb-8">
      {/* Top Header Section */}
      <div className="pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại chọn tháng"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" /> {/* Spacer cân xứng */}
        </div>
      </div>

      {/* Center Section: Badge Tháng + Chữ 3D COMING SOON! Chuẩn mẫu */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-4 space-y-6">
        {/* Huy hiệu viên thuốc hiển thị Tên Tháng */}
        <div
          className="inline-block bg-white px-10 py-2 rounded-full shadow-md tracking-wider uppercase border-[2.5px]"
          style={{
            borderColor: titleColor,
            color: titleColor,
          }}
        >
          <span className="text-xl sm:text-2xl font-black">{monthName}</span>
        </div>

        {/* Chữ 3D nghệ thuật COMING SOON! nổi bật giữa bầu trời */}
        <div
          className="text-5xl sm:text-6xl font-black tracking-wider leading-[0.95] text-center select-none"
          style={{
            color: titleColor,
            filter: 'drop-shadow(0 5px 0 rgba(0,0,0,0.15))',
            textShadow: `
              -3px -3px 0 #ffffff,
               3px -3px 0 #ffffff,
              -3px  3px 0 #ffffff,
               3px  3px 0 #ffffff,
              -3px  0px 0 #ffffff,
               3px  0px 0 #ffffff,
               0px -3px 0 #ffffff,
               0px  3px 0 #ffffff,
               0px  5px 0 ${shadowColor}
            `,
          }}
        >
          COMING<br />SOON!
        </div>
      </div>

      {/* Khoảng trống phía dưới để hình nền hoa hướng dương và bóng bay hiển thị trọn vẹn */}
      <div className="h-10 pointer-events-none" />
    </div>
  );
};
