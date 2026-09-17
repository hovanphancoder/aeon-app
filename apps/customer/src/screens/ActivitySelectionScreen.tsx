import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { AeonLogo } from '../components/AeonLogo';
import workshopTitleImg from '../assets/APP-24.png';
import nailXinhNoteImg from '../assets/APP-25.png';
import netDieuNoteImg from '../assets/APP-26.png';

export interface ActivityItem {
  id: string;
  monthId: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description: string;
  rules?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  startDate?: string | null;
  endDate?: string | null;
}

interface ActivitySelectionScreenProps {
  month: { id: string; name: string };
  onSelectActivity: (activity: ActivityItem) => void;
  onBack: () => void;
  onOpenRules: () => void;
}

export const ActivitySelectionScreen: React.FC<ActivitySelectionScreenProps> = ({
  month,
  onSelectActivity,
  onBack,
  onOpenRules: _onOpenRules,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [month.id]);

  const fetchActivities = async () => {
    try {
      const res = await api.getActivities(month.id);
      if (res.data && res.data.length > 0) {
        setActivities(res.data);
      } else {
        setActivities(getDefaultActivities());
      }
    } catch {
      setActivities(getDefaultActivities());
    }
  };

  const getDefaultActivities = (): ActivityItem[] => [
    {
      id: 'act-1',
      monthId: month.id,
      name: 'Nail Xinh Tặng Nàng',
      slug: 'nail-xinh',
      description: 'CÙNG AEON THAM GIA WORKSHOP LÀM NAIL NGHỆ THUẬT VÀ NHẬN NGAY BỘ NAIL BOX',
      rules: 'Áp dụng cho hóa đơn mua sắm từ 300.000 VNĐ tại AEON Hải Dương.',
      status: 'ACTIVE',
    },
    {
      id: 'act-2',
      monthId: month.id,
      name: 'Nét Điệu Cho Nàng',
      slug: 'net-dieu',
      description: 'CÙNG AEON TRẢI NGHIỆM TRANG ĐIỂM RẠNG RỠ VÀ NHẬN SET QUÀ MỸ PHẨM',
      rules: 'Áp dụng cho hóa đơn mua sắm từ 500.000 VNĐ tại AEON Hải Dương.',
      status: 'ACTIVE',
    },
  ];

  const handleSelectNail = () => {
    const act =
      activities.find(
        (a) =>
          a.slug.toLowerCase().includes('nail') ||
          a.name.toLowerCase().includes('nail')
      ) ||
      activities[0] ||
      getDefaultActivities()[0];
    onSelectActivity(act);
  };

  const handleSelectNetDieu = () => {
    const act =
      activities.find(
        (a) =>
          a.slug.toLowerCase().includes('dieu') ||
          a.name.toLowerCase().includes('điệu')
      ) ||
      activities[1] ||
      getDefaultActivities()[1];
    onSelectActivity(act);
  };

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent px-4 py-2 pb-5">
      {/* Top Section: Header (Back button + Logo AEON Hải Dương) */}
      <div className="space-y-1">
        {/* Row 1: Back arrow + LOGO */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" /> {/* Cân đối */}
        </div>

        {/* Tiêu đề chính thức WORKSHOP CHO NÀNG (APP-24.png) & Huy hiệu thời gian */}
        <div className="text-center flex flex-col items-center pt-0.5">
          <img
            src={workshopTitleImg}
            alt="Workshop Cho Nàng"
            className="w-56 sm:w-64 max-w-[80%] h-auto object-contain drop-shadow-sm select-none pointer-events-none"
          />

          {/* Badge Thời gian chương trình 2 dòng chuẩn mẫu */}
          <div className="inline-block bg-[#FFF574] text-center px-4 py-0.5 rounded-2xl shadow-sm border border-amber-200 leading-tight mt-0.5">
            <p className="text-[10px] sm:text-[11px] font-black text-[#5C1D82] uppercase tracking-wide">
              THỜI GIAN CHƯƠNG TRÌNH:
            </p>
            <p className="text-[11px] sm:text-[12px] font-black text-[#E60067] tracking-wider">
              18 - 20.10.2026
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: 2 Tấm Sticky Notes tương tác bấm chọn hoạt động - Tách rời, không bị đè dính */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-[340px] mx-auto py-2 space-y-2.5 sm:space-y-3.5">
        {/* Note 1: NAIL XINH TẶNG NÀNG (APP-25.png) - Lệch sang trái */}
        <div className="w-full flex justify-start pl-1 sm:pl-3">
          <button
            type="button"
            onClick={handleSelectNail}
            className="w-44 sm:w-48 max-w-[58%] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            title="Tham gia Nail Xinh Tặng Nàng"
          >
            <img
              src={nailXinhNoteImg}
              alt="Nail Xinh Tặng Nàng"
              className="w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none"
            />
          </button>
        </div>

        {/* Note 2: NÉT ĐIỆU CHO NÀNG (APP-26.png) - Lệch sang phải, cách biệt rõ ràng */}
        <div className="w-full flex justify-end pr-1 sm:pr-3">
          <button
            type="button"
            onClick={handleSelectNetDieu}
            className="w-44 sm:w-48 max-w-[58%] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            title="Tham gia Nét Điệu Cho Nàng"
          >
            <img
              src={netDieuNoteImg}
              alt="Nét Điệu Cho Nàng"
              className="w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none"
            />
          </button>
        </div>
      </div>

      {/* Khoảng đệm phía dưới để hoa hướng dương và bóng bay của hình nền hiển thị trọn vẹn */}
      <div className="h-4 sm:h-6 pointer-events-none" />
    </div>
  );
};
