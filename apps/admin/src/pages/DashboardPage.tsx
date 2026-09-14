import React, { useEffect, useState } from 'react';
import { Users, Receipt, Clock, CheckCircle2, XCircle, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { adminApi } from '../api/client';

interface DashboardData {
  totalCustomers: number;
  totalBills: number;
  pendingBills: number;
  approvedBills: number;
  rejectedBills: number;
  billsByMonth: { monthName: string; count: number }[];
  billsByActivity: { activityName: string; count: number }[];
}

export const DashboardPage: React.FC<{ onNavigateToBills: () => void }> = ({
  onNavigateToBills,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng Khách Hàng',
      value: data?.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Tổng Lượt Nộp Bill',
      value: data?.totalBills || 0,
      icon: Receipt,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      title: 'Hóa Đơn Chờ Duyệt',
      value: data?.pendingBills || 0,
      icon: Clock,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
      highlight: true,
    },
    {
      title: 'Hóa Đơn Đã Duyệt',
      value: data?.approvedBills || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Hóa Đơn Bị Từ Chối',
      value: data?.rejectedBills || 0,
      icon: XCircle,
      color: 'bg-rose-500',
      bgLight: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Pending Alert Banner */}
      {data && data.pendingBills > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black">
                Có {data.pendingBills} hóa đơn đang chờ nhân viên duyệt!
              </h3>
              <p className="text-xs text-white/90">
                Khách hàng đang đợi kết quả tại quầy. Vui lòng kiểm tra và phê duyệt ngay.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToBills}
            className="px-5 py-2.5 bg-white text-gray-900 font-bold text-xs rounded-2xl shadow-md hover:bg-rose-50 transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <span>Duyệt Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Thẻ Số Liệu Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-white border shadow-sm flex flex-col justify-between space-y-3 ${
                card.highlight ? 'ring-2 ring-amber-400/50' : 'border-gray-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgLight}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 leading-none">
                  {loading ? '...' : card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Biểu đồ & Thống kê chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phân bổ theo Tháng */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-aeon-primary" />
            <h3 className="font-bold text-sm text-gray-900">Lượt Nộp Hóa Đơn Theo Tháng</h3>
          </div>

          <div className="space-y-3 pt-2">
            {data?.billsByMonth.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{m.monthName}</span>
                  <span className="font-bold">{m.count} bill</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-aeon-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${data.totalBills > 0 ? (m.count / data.totalBills) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phân bổ theo Hoạt Động Workshop */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-900">Lượt Đăng Ký Theo Hoạt Động</h3>
          </div>

          <div className="space-y-3 pt-2">
            {data?.billsByActivity.map((act, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{act.activityName}</span>
                  <span className="font-bold">{act.count} lượt</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${data.totalBills > 0 ? (act.count / data.totalBills) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
