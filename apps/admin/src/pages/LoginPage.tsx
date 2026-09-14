import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState<string>('admin@aeon.vn');
  const [password, setPassword] = useState<string>('admin123456');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      setLoading(true);
      const res = await adminApi.login({ email, password });
      if (res.data?.token && res.data?.admin) {
        login(res.data.token, res.data.admin);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-aeon-primary text-white font-black text-2xl px-4 py-1.5 rounded-2xl shadow-lg">
            AEON
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            AEON HẢI DƯƠNG
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            CỔNG QUẢN TRỊ & PHÊ DUYỆT HÓA ĐƠN
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-slate-400">
              Vui lòng sử dụng tài khoản được cấp bởi ban tổ chức AEON
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-2xl flex items-start space-x-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Email Quản Trị
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aeon.vn"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-aeon-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-aeon-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-aeon-primary hover:bg-aeon-dark text-white font-bold rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Đăng Nhập Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1 text-center">
            <span className="font-bold text-slate-300 block">Tài khoản mặc định:</span>
            <p>admin@aeon.vn / admin123456</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          © 2026 AEON Việt Nam. Hệ thống bảo mật nội bộ.
        </p>
      </div>
    </div>
  );
};
