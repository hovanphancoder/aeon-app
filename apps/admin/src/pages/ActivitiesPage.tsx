import React, { useEffect, useState } from 'react';
import { Gift, Plus, Edit2, CheckCircle2, X, Sparkles } from 'lucide-react';
import { adminApi } from '../api/client';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [monthId, setMonthId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [rules, setRules] = useState<string>('');
  const [banner, setBanner] = useState<string>('');
  const [status, setStatus] = useState<string>('ACTIVE');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, mRes] = await Promise.all([
        adminApi.listActivities(),
        adminApi.listMonths(),
      ]);
      if (aRes.data) setActivities(aRes.data);
      if (mRes.data) {
        setMonths(mRes.data);
        if (mRes.data.length > 0 && !monthId) {
          setMonthId(mRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Lỗi tải hoạt động:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingActivity(null);
    setName('');
    setDescription('');
    setRules('');
    setBanner('');
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (act: any) => {
    setEditingActivity(act);
    setName(act.name);
    setMonthId(act.monthId);
    setDescription(act.description);
    setRules(act.rules || '');
    setBanner(act.banner || '');
    setStatus(act.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await adminApi.updateActivity(editingActivity.id, {
          name,
          monthId,
          description,
          rules,
          banner,
          status,
        });
      } else {
        await adminApi.createActivity({
          name,
          monthId,
          description,
          rules,
          banner,
          status,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu hoạt động');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Quản Lý Hoạt Động Workshop</h1>
          <p className="text-xs text-gray-500">
            Thêm mới hoặc chỉnh sửa các hoạt động dành cho khách hàng tham gia đổi quà
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-aeon-primary hover:bg-aeon-dark text-white font-bold text-xs rounded-2xl shadow-md flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hoạt Động Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activities.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              {act.banner ? (
                <div className="h-36 w-full overflow-hidden bg-gray-100">
                  <img src={act.banner} alt={act.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-24 bg-gradient-to-r from-rose-500 to-aeon-primary p-4 text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">{act.month?.name}</span>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
              )}

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                      act.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {act.status}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{act.month?.name}</span>
                </div>

                <h3 className="text-base font-black text-gray-900 leading-snug">{act.name}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{act.description}</p>
                {act.rules && (
                  <p className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-100 line-clamp-2">
                    {act.rules}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs font-medium text-gray-500">
                {act._count?.billSubmissions || 0} bill đã nộp
              </span>
              <button
                onClick={() => handleOpenEdit(act)}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:border-aeon-primary text-gray-800 hover:text-aeon-primary text-xs font-bold rounded-xl flex items-center space-x-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingActivity ? 'Chỉnh Sửa Hoạt Động' : 'Thêm Hoạt Động Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Tên Hoạt Động *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: NAIL XINH TẶNG NÀNG"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-aeon-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Thuộc Tháng *</label>
                  <select
                    value={monthId}
                    onChange={(e) => setMonthId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none"
                  >
                    {months.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">Trạng Thái *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Mở)</option>
                    <option value="INACTIVE">INACTIVE (Đóng)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Mô Tả Hoạt Động *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả quyền lợi và workshop..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-aeon-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Thể Lệ Riêng Của Hoạt Động</label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Ví dụ: Áp dụng hóa đơn từ 300.000đ..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-aeon-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Link Ảnh Banner (Nếu có)</label>
                <input
                  type="url"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://domain.com/banner.jpg"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-aeon-primary"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-aeon-primary hover:bg-aeon-dark text-white rounded-xl font-bold shadow-sm"
                >
                  Lưu Hoạt Động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
