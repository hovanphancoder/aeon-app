import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Gift, ChevronRight, AlertCircle, Info, Calendar } from 'lucide-react';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchActivities();
  }, [month.id]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.getActivities(month.id);
      if (res.data) {
        setActivities(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title={`Hoạt Động ${month.name}`} />

        <div className="p-4 space-y-5">
          {/* Nút Quay lại */}
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-aeon-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn lại tháng khác</span>
          </button>

          {/* Heading */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-aeon-primary uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>WORKSHOP & HOẠT ĐỘNG {month.name}</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              Chọn Hoạt Động Muốn Tham Gia
            </h1>
            <p className="text-xs text-gray-500">
              Mỗi hóa đơn hợp lệ sẽ nhận được 1 lượt trải nghiệm workshop tương ứng
            </p>
          </div>

          {/* Danh sách Activity */}
          {loading ? (
            <LoadingSpinner text="Đang tải các hoạt động..." />
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-card border border-rose-100 text-gray-500 space-y-2">
              <p className="text-sm font-semibold">Hiện chưa có hoạt động nào được kích hoạt trong tháng này.</p>
              <button
                onClick={onBack}
                className="text-xs text-aeon-primary font-bold hover:underline"
              >
                Quay lại chọn tháng khác
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-card border border-rose-100/70 transition-all hover:shadow-lg flex flex-col"
                >
                  {/* Banner / Poster hoạt động */}
                  {act.banner ? (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                      <img
                        src={act.banner}
                        alt={act.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-4 text-xs font-bold text-white bg-aeon-primary px-2.5 py-1 rounded-full shadow-sm">
                        Đang Mở Đăng Ký
                      </span>
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-r from-rose-500 via-aeon-primary to-aeon-dark p-5 text-white flex items-center justify-between relative overflow-hidden">
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20">
                          WORKSHOP ĐẶC QUYỀN
                        </span>
                        <h3 className="text-lg font-black tracking-wide">
                          {act.name}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-yellow-300" />
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                        {act.name}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {act.description}
                      </p>

                      {act.rules && (
                        <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100/60 text-xs text-rose-950 flex items-start space-x-2">
                          <Info className="w-4 h-4 text-aeon-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{act.rules}</span>
                        </div>
                      )}
                    </div>

                    {/* Nút bấm Chọn */}
                    <button
                      onClick={() => onSelectActivity(act)}
                      className="mt-4 w-full py-3 bg-aeon-primary hover:bg-aeon-dark text-white font-bold rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all"
                    >
                      <span>Tham Gia Hoạt Động Này</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 text-center">
        <button
          onClick={onOpenRules}
          className="text-xs text-aeon-primary font-bold hover:underline"
        >
          Xem Thể Lệ & Quy Định Hóa Đơn Hợp Lệ
        </button>
      </div>
    </div>
  );
};
