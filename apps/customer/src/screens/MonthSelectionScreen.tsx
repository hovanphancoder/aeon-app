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

  const handleMonthClick = (month: MonthItem) => {
    if (month.status === 'ACTIVE') {
      onSelectActiveMonth(month);
    } else {
      onSelectComingSoonMonth(month);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-6 pb-8">
      {/* Top Header Section */}
      <div className="space-y-8">
        {/* Row 1: Back arrow + Logo AEON */}
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <button
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

          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Row 2: Tiêu đề lớn MỘT ĐIỂM ĐẾN / MỞ ĐA TRẢI NGHIỆM (APP-21.svg) */}
        <div className="text-center pt-2">
          <CampaignBanner className="w-[88%] max-w-[320px] h-auto object-contain mx-auto drop-shadow-sm" />
        </div>

        {/* Row 3: 3 Nút Chọn Tháng Dạng Viên Thuốc Màu Xanh Than */}
        <div className="pt-8 flex flex-col items-center space-y-6">
          {months.map((month) => (
            <button
              key={month.id}
              onClick={() => handleMonthClick(month)}
              className="w-[85%] max-w-[280px] py-4 rounded-full bg-[#005E8A] hover:bg-[#004E73] active:scale-95 text-white font-black text-base sm:text-lg tracking-wider shadow-md text-center transition-all"
            >
              {month.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Footer link thể lệ */}
      <div className="text-center pt-8">
        <button
          onClick={onOpenRules}
          className="text-xs text-gray-600 font-bold hover:underline"
        >
          Xem thể lệ chương trình
        </button>
      </div>
    </div>
  );
};
