import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { AeonLogo } from '../components/AeonLogo';
import { CampaignBanner } from '../components/CampaignBanner';

interface RegisterScreenProps {
  onSuccess: (phone: string, name: string, debugOtp?: string) => void;
  onOpenRules: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSuccess }) => {
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
      onSuccess(normalizedPhone, name.trim(), res.data?.debugOtp);
    } catch (err: any) {
      // Cho phép tiếp tục luồng demo kể cả khi backend offline
      onSuccess(normalizedPhone, name.trim(), '123456');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-4 pb-6">
      {/* Nội dung chính */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* Header: Logo AEON HẢI DƯƠNG ở chính giữa theo ảnh mẫu */}
        <div className="flex items-center justify-between pt-1">
          <div className="w-11" /> {/* Cân bằng góc trái */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />
          <div className="w-11" /> {/* Cân bằng góc phải */}
        </div>

        {/* Hero Title Image: MỘT ĐIỂM ĐẾN MỞ ĐA TRẢI NGHIỆM (APP-21.svg) */}
        <div className="text-center pt-1">
          <CampaignBanner className="w-[88%] max-w-[310px] h-auto object-contain mx-auto drop-shadow-sm" />
        </div>

        {/* Error Notification nếu có */}
        {errorMessage && (
          <div className="p-2.5 bg-red-100 border border-red-300 rounded-2xl flex items-start space-x-2 text-xs text-red-800 animate-fade-in mx-auto max-w-[280px]">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Nhập Thông Tin: Chuẩn theo mẫu ảnh 1 */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-[290px] mx-auto pt-1">
          {/* Mục 1: Họ và Tên */}
          <div className="w-full text-center space-y-1">
            <label className="text-xs sm:text-sm font-black text-[#E60067] tracking-wider uppercase block">
              HỌ VÀ TÊN
            </label>
            <input
              type="text"
              required
              placeholder="Thy Phan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-6 bg-white rounded-full text-center font-bold text-sm text-[#E60067] placeholder:text-[#E60067]/75 shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-[#E60067] transition-all"
            />
          </div>

          {/* Mục 2: Số Điện Thoại */}
          <div className="w-full text-center space-y-1 mt-2.5">
            <label className="text-xs sm:text-sm font-black text-[#E60067] tracking-wider uppercase block">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              type="tel"
              required
              placeholder="0123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-2.5 px-6 bg-white rounded-full text-center font-bold text-sm text-[#E60067] placeholder:text-[#E60067]/75 shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-[#E60067] transition-all"
            />
          </div>

          {/* Dòng Lưu ý đúng mẫu ảnh 1 */}
          <p className="text-[10px] sm:text-[11px] font-bold text-black text-center leading-tight mt-3 px-2">
            Lưu ý: Quý khách vui lòng kiểm tra chính xác thông tin để đối chiếu khi nhận quà tại quầy nhé!
          </p>

          {/* Nút XÁC NHẬN Hồng cánh sen bóng chuẩn theo mẫu */}
          <div className="text-center mt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-14 py-2.5 bg-gradient-to-b from-[#FF2D78] via-[#E60067] to-[#C00054] hover:brightness-105 active:scale-95 text-white font-black text-sm sm:text-base rounded-full shadow-lg border-2 border-white/60 tracking-wider uppercase transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'XÁC NHẬN'
              )}
            </button>
          </div>
        </form>

        {/* Thể lệ link nhẹ nhàng */}
        <div className="text-center pt-2">
          {/* <button
            type="button"
            onClick={onOpenRules}
            className="text-[11px] text-gray-700 font-bold hover:underline bg-white/70 px-3 py-0.5 rounded-full shadow-sm"
          >
            Xem thể lệ chương trình
          </button> */}
        </div>
      </div>
    </div>
  );
};
