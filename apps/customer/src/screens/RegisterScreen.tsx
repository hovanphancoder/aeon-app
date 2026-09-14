import React, { useState } from 'react';
import { Sparkles, Phone, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

interface RegisterScreenProps {
  onSuccess: (phone: string, name: string, debugOtp?: string) => void;
  onOpenRules: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSuccess, onOpenRules }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    const cleanPhone = phone.replace(/[\s.+()-]/g, '');
    const normalizedPhone = cleanPhone.startsWith('84') ? '0' + cleanPhone.slice(2) : cleanPhone;
    const phoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      setErrorMessage('Số điện thoại không đúng định dạng di động Việt Nam.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestOtp(normalizedPhone, name.trim());
      
      // Chuyển sang màn hình OTP
      onSuccess(normalizedPhone, name.trim(), res.data?.debugOtp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/40 flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Top Banner / Key Visual */}
      <div className="space-y-6 pt-4">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-aeon-primary text-white font-black text-lg px-3 py-1 rounded-xl shadow-md">
              AEON
            </span>
            <div className="leading-none">
              <span className="text-[10px] font-extrabold uppercase text-aeon-primary tracking-wider block">
                TRUNG TÂM THƯƠNG MẠI
              </span>
              <span className="text-sm font-black text-gray-900">
                AEON HẢI DƯƠNG
              </span>
            </div>
          </div>
          <button
            onClick={onOpenRules}
            type="button"
            className="text-xs font-semibold text-aeon-primary bg-white/90 border border-rose-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-rose-50 transition-colors btn-active-scale"
          >
            Thể Lệ
          </button>
        </div>

        {/* Hero Card Visual */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-aeon-primary via-rose-600 to-aeon-dark p-6 text-white shadow-aeon">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/20 rounded-full blur-xl -ml-6 -mb-6"></div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>CHƯƠNG TRÌNH ĐẶC QUYỀN</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              ĐỔI HÓA ĐƠN <br />
              <span className="text-yellow-300">THAM GIA WORKSHOP</span>
            </h1>
            <p className="text-xs text-white/85 leading-relaxed font-normal">
              Mua sắm thả ga tại AEON Hải Dương, chụp ảnh hóa đơn để nhận ngay vé trải nghiệm các hoạt động làm đẹp và quà tặng độc quyền.
            </p>
          </div>
        </div>

        {/* Form Đăng ký */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-100/60 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900">Đăng Ký Tham Gia</h2>
            <p className="text-xs text-gray-500">
              Nhập thông tin của bạn để nhận mã xác thực qua tin nhắn Zalo
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Họ và Tên <span className="text-aeon-primary">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-aeon-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Số Điện Thoại (Zalo) <span className="text-aeon-primary">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-aeon-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Nút Tiếp Tục */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-aeon-primary to-aeon-dark hover:opacity-95 text-white font-bold rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Tiếp Tục</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="py-4 text-center space-y-2">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span>Bảo mật thông tin khách hàng tuyệt đối</span>
        </div>
        <p className="text-[11px] text-gray-400">
          © 2026 AEON Hải Dương. Bản quyền thuộc AEON Việt Nam.
        </p>
      </div>
    </div>
  );
};
