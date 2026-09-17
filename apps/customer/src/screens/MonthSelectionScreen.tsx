import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { AeonLogo } from '../components/AeonLogo';
import { CampaignBanner } from '../components/CampaignBanner';

export interface MonthItem {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'COMING_SOON' | 'INACTIVE';
  startDate?: string;
  endDate?: string;
}

interface MonthSelectionScreenProps {
  onSelectActiveMonth: (month: MonthItem) => void;
  onSelectComingSoonMonth: (month: MonthItem) => void;
  onOpenRules: () => void;
  onBack?: () => void;
}

export const MonthSelectionScreen: React.FC<MonthSelectionScreenProps> = ({
  onSelectActiveMonth,
  onSelectComingSoonMonth,
  onOpenRules,
  onBack,
}) => {
  const [months, setMonths] = useState<MonthItem[]>([]);

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      const res = await api.getMonths();
      if (res.data && res.data.length > 0) {
        setMonths(res.data);
      } else {
        setMonths(getDefaultMonths());
      }
    } catch {
      setMonths(getDefaultMonths());
    }
  };

  const getDefaultMonths = (): MonthItem[] => [
    { id: 'm-10', name: 'THÁNG 10', slug: 'thang-10', status: 'ACTIVE' },
    { id: 'm-11', name: 'THÁNG 11', slug: 'thang-11', status: 'COMING_SOON' },
    { id: 'm-12', name: 'THÁNG 12', slug: 'thang-12', status: 'COMING_SOON' },
  ];

  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const handleMonthClick = (month: MonthItem) => {
    setSelectedMonthId(month.id);
    setTimeout(() => {
      if (month.status === 'ACTIVE') {
        onSelectActiveMonth(month);
      } else {
        onSelectComingSoonMonth(month);
      }
    }, 180);
  };

  // Cấu hình bảng màu chuẩn theo ảnh mẫu 3 & 4
  const monthColorStyles = [
    {
      // Tháng 10: Màu hồng cánh sen
      inactive: 'bg-white border-[#E60067] text-[#E60067] hover:bg-rose-50',
      active: 'bg-[#E60067] border-[#E60067] text-white shadow-md',
    },
    {
      // Tháng 11: Màu xanh lá cây
      inactive: 'bg-white border-[#00A859] text-[#00A859] hover:bg-emerald-50',
      active: 'bg-[#00A859] border-[#00A859] text-white shadow-md',
    },
    {
      // Tháng 12: Màu vàng cam
      inactive: 'bg-white border-[#E57900] text-[#E57900] hover:bg-amber-50',
      active: 'bg-[#E57900] border-[#E57900] text-white shadow-md',
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-4 pb-6">
      {/* Top Header Section */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Row 1: Back arrow tím hồng + Logo AEON ở giữa */}
        <div className="flex items-center justify-between pt-1">
          {onBack ? (
            <button
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

          <div className="w-11" /> {/* Spacer cân xứng */}
        </div>

        {/* Row 2: Tiêu đề lớn MỘT ĐIỂM ĐẾN / MỞ ĐA TRẢI NGHIỆM (APP-21.svg) */}
        <div className="text-center pt-1">
          <CampaignBanner className="w-[88%] max-w-[310px] h-auto object-contain mx-auto drop-shadow-sm" />
        </div>

        {/* Row 3: 3 Nút Chọn Tháng Viền Màu Bo Tròn Chuẩn Ảnh Mẫu 3 & 4 */}
        <div className="flex flex-col items-center w-full pt-2">
          <div className="flex flex-col items-center space-y-3.5 w-full">
            {months.map((month, idx) => {
              const isSelected = selectedMonthId === month.id;
              const colorConfig = monthColorStyles[idx % monthColorStyles.length];
              const buttonClass = isSelected ? colorConfig.active : colorConfig.inactive;

              return (
                <button
                  key={month.id}
                  onClick={() => handleMonthClick(month)}
                  className={`w-[78%] max-w-[260px] py-2.5 sm:py-3 rounded-full font-black text-base sm:text-lg tracking-wider border-[2.5px] text-center active:scale-95 transition-all ${buttonClass}`}
                >
                  {month.name.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Dòng chữ chú thích bên dưới 3 nút */}
          <p className="text-[10px] sm:text-[11px] font-bold text-black text-center max-w-[250px] mx-auto mt-4 leading-tight">
            Quý khách vui lòng chọn thời gian tham gia hoạt động
          </p>
        </div>

        {/* Footer link thể lệ */}
        <div className="text-center pt-3">
          {/* <button
            onClick={onOpenRules}
            className="text-[11px] text-gray-700 font-bold hover:underline bg-white/70 px-3 py-0.5 rounded-full shadow-sm"
          >
            Xem thể lệ chương trình
          </button> */}
        </div>
      </div>
    </div>
  );
};
