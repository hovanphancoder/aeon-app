import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [rules, setRules] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRules();
      if (res.data?.rules) {
        setRules(res.data.rules);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thể lệ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await adminApi.updateRules(rules);
      setMessage('Đã lưu nội dung Thể Lệ thành công! Nội dung này sẽ lập tức hiển thị cho khách hàng.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thể lệ. Chỉ Super Admin mới có quyền cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900">Quản Lý Thể Lệ & Nội Dung</h1>
        <p className="text-xs text-gray-500">
          Nội dung dưới đây sẽ được tải trực tiếp khi khách hàng nhấn vào nút "THỂ LỆ" trên web
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-aeon-primary" />
            <h3 className="font-bold text-sm text-gray-900">Nội Dung Thể Lệ Tham Gia Chương Trình</h3>
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="px-4 py-2 bg-aeon-primary hover:bg-aeon-dark text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Đang tải thể lệ hiện tại...
          </div>
        ) : (
          <textarea
            rows={16}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800 leading-relaxed focus:outline-none focus:border-aeon-primary focus:bg-white resize-y"
            placeholder="Nhập nội dung thể lệ, quy định hóa đơn hợp lệ..."
          />
        )}
      </form>
    </div>
  );
};
