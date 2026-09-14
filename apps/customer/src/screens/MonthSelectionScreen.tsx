import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

interface MonthItem {
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
}

export const MonthSelectionScreen: React.FC<MonthSelectionScreenProps> = ({
  onSelectActiveMonth,
  onSelectComingSoonMonth,
  onOpenRules,
}) => {
  const { customer } = useAuth();
  const [months, setMonths] = useState<MonthItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      setLoading(true);
      const res = await api.getMonths();
      if (res.data) {
        setMonths(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tháng sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (month: MonthItem) => {
    if (month.status === 'ACTIVE') {
      onSelectActiveMonth(month);
    } else if (month.status === 'COMING_SOON') {
      onSelectComingSoonMonth(month);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title="Chọn Tháng Tham Gia" />

        <div className="p-4 space-y-6">
          {/* Lời chào khách hàng */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-rose-100/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-gray-500 font-medium">Xin chào,</span>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {customer?.name || 'Quý khách'}
              </h2>
              <span className="text-xs text-aeon-primary font-semibold">
                {customer?.phone}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-aeon-primary flex items-center justify-center font-bold text-lg shadow-inner">
              <Sparkles className="w-6 h-6 text-aeon-primary" />
            </div>
          </div>

          {/* Tiêu đề mục chọn tháng */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-aeon-primary uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>GIAI ĐOẠN CHƯƠNG TRÌNH</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">
              Vui Lòng Chọn Tháng
            </h1>
            <p className="text-xs text-gray-500">
              Mỗi tháng sẽ có các hoạt động workshop và quà tặng tương ứng
            </p>
          </div>

          {/* Nội dung danh sách Tháng */}
          {loading ? (
            <LoadingSpinner text="Đang tải các đợt sự kiện..." />
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {months.map((month) => {
                const isActive = month.status === 'ACTIVE';
                const isComingSoon = month.status === 'COMING_SOON';

                return (
                  <button
                    key={month.id}
                    onClick={() => handleMonthClick(month)}
                    className={`w-full p-5 rounded-3xl text-left transition-all relative overflow-hidden flex items-center justify-between btn-active-scale ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 via-aeon-primary to-aeon-dark text-white shadow-aeon'
                        : 'bg-white border border-gray-200/90 text-gray-800 shadow-sm hover:border-rose-200'
                    }`}
                  >
                    {/* Background visual accents */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                    )}

                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isActive ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
                        </span>
                      </div>
                      <h3
                        className={`text-lg font-black tracking-wide ${
                          isActive ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {month.name}
                      </h3>
                      <p
                        className={`text-xs ${
                          isActive ? 'text-white/85' : 'text-gray-500'
                        }`}
                      >
                        {isActive
                          ? 'Bấm để xem danh sách workshop & nộp bill'
                          : 'Chương trình sẽ mở vào thời gian tới'}
                      </p>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="p-4 text-center">
        <button
          onClick={onOpenRules}
          className="text-xs text-aeon-primary font-bold hover:underline"
        >
          Xem Thể Lệ & Quy Định Đổi Quà AEON
        </button>
      </div>
    </div>
  );
};
