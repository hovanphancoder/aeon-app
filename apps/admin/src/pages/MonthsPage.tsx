import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, Edit2, Save, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';

export const MonthsPage: React.FC = () => {
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listMonths();
      if (res.data) setMonths(res.data);
    } catch (err) {
      console.error('Lỗi tải tháng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (monthId: string, status: string) => {
    try {
      await adminApi.updateMonth(monthId, { status });
      setMessage(`Đã cập nhật trạng thái tháng thành công!`);
      setTimeout(() => setMessage(''), 3000);
      fetchMonths();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900">Quản Lý Tháng & Giai Đoạn</h1>
        <p className="text-xs text-gray-500">
          Cấu hình trạng thái hiển thị cho khách hàng (Đang diễn ra, Sắp diễn ra hoặc Tạm dừng)
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {months.map((month) => {
          const isActive = month.status === 'ACTIVE';
          const isComingSoon = month.status === 'COMING_SOON';

          return (
            <div
              key={month.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : isComingSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : isComingSoon ? 'COMING SOON' : 'INACTIVE'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">#{month.slug}</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">{month.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {month._count?.activities || 0} Hoạt động | {month._count?.billSubmissions || 0} Hóa đơn
                  </p>
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 block uppercase">
                  Chuyển Trạng Thái:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(month.id, 'ACTIVE')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50'
                    }`}
                  >
                    Active
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(month.id, 'COMING_SOON')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      isComingSoon
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50'
                    }`}
                  >
                    Soon
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(month.id, 'INACTIVE')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      month.status === 'INACTIVE'
                        ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Tắt
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
