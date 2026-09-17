import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { AeonLogo } from '../components/AeonLogo';

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
  onOpenRules,
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

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent">
      {/* Nội dung chính */}
      <div className="relative z-10 p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header: Nút Quay Lại + ĐỔI LOGO + Tiêu đề WORKSHOP CHO NÀNG */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            {/* Nút quay lại màu tím như trong thiết kế */}
            <button
              onClick={onBack}
              className="w-14 h-8 rounded-full bg-[#8E24AA] hover:bg-[#7B1FA2] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Logo AEON Hải Dương chính thức */}
            <AeonLogo className="h-9 sm:h-11 w-auto object-contain" />

            <div className="w-14" /> {/* Spacer cân xứng */}
          </div>

          {/* Banner Tiêu đề: WORKSHOP CHO NÀNG */}
          <div className="text-center pt-1">
            <div className="inline-block bg-[#FF4081] text-black font-black text-lg px-6 py-2 rounded-2xl shadow-md border-2 border-pink-300 tracking-wide uppercase">
              WORKSHOP CHO NÀNG
            </div>
          </div>
        </div>

        {/* Danh sách 2 Tấm Thiệp / Sticky Notes (Nail Xinh & Nét Điệu) */}
        <div className="space-y-6 my-auto py-2">
          {activities.map((act, index) => {
            const isFirst = index === 0;
            // Card 1: Băng keo màu xanh lá; Card 2: Băng keo màu xanh dương
            const tapeColor = isFirst ? 'bg-[#84CC16]' : 'bg-[#0284C7]';
            const tapeBorder = isFirst ? 'border-[#65A30D]' : 'border-[#0369A1]';
            const bannerTextColor = isFirst ? 'text-[#10B981]' : 'text-[#0284C7]';

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-white cursor-pointer transform active:scale-95 hover:shadow-2xl transition-all"
              >
                {/* 2 miếng băng dính dán ở 2 góc trên như thiết kế */}
                <div
                  className={`absolute -top-3.5 left-8 w-14 h-7 ${tapeColor} opacity-90 -rotate-6 shadow-sm border-t border-b ${tapeBorder}`}
                  style={{
                    clipPath: 'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)',
                  }}
                />
                <div
                  className={`absolute -top-3.5 right-8 w-14 h-7 ${tapeColor} opacity-90 rotate-6 shadow-sm border-t border-b ${tapeBorder}`}
                  style={{
                    clipPath: 'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)',
                  }}
                />

                {/* Nội dung bên trong thiệp */}
                <div className="text-center space-y-3 pt-2">
                  <div className={`text-base font-black uppercase tracking-wider ${bannerTextColor}`}>
                    CÙNG AEON
                  </div>

                  {/* Badge Tên Hoạt Động (Màu hồng đậm, chữ đen đậm như thiết kế) */}
                  <div className="inline-block bg-[#FF4081] text-black font-black text-xl px-7 py-2.5 rounded-3xl shadow-md border border-pink-300 tracking-wide">
                    {act.name}
                  </div>

                  <p className="text-xs font-semibold text-gray-600 line-clamp-2 px-2 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="inline-flex items-center space-x-1 text-xs font-black text-[#FF4081] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bấm để chụp & nộp hóa đơn</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút Thể Lệ cố định phía dưới */}
        <div className="text-center pt-2 pb-1 relative z-20">
          <button
            onClick={onOpenRules}
            className="px-8 py-2 bg-[#005E8A] hover:bg-[#004768] text-white font-extrabold text-sm rounded-full shadow-lg border border-white/50 active:scale-95 transition-all"
          >
            thể lệ
          </button>
        </div>
      </div>

      {/* 3. Đồi cỏ xanh mướt uốn lượn ở chân trang (Grass Hill) */}
      <div className="relative w-full h-24 pointer-events-none -mt-12 z-0">
        <svg
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Lớp đồi xa */}
          <path
            d="M0,50 Q120,10 240,40 T400,30 L400,120 L0,120 Z"
            fill="#84CC16"
            opacity="0.8"
          />
          {/* Lớp đồi gần */}
          <path
            d="M0,65 Q150,25 280,60 T400,45 L400,120 L0,120 Z"
            fill="#65A30D"
          />
        </svg>
      </div>
    </div>
  );
};
