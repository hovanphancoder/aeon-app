import React, { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { AeonLogo } from '../components/AeonLogo';
import { CampaignBanner } from '../components/CampaignBanner';

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
      onSuccess(normalizedPhone, name.trim(), res.data?.debugOtp);
    } catch (err: any) {
      // Cho phép tiếp tục luồng demo kể cả khi backend offline
      onSuccess(normalizedPhone, name.trim(), '123456');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent">
      {/* Nội dung chính */}
      <div className="relative z-10 p-4 space-y-4 flex-1 flex flex-col justify-between pb-2">
        {/* Header: Nút Quay Lại Tím + ĐỔI LOGO Badge */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onOpenRules}
            className="w-14 h-8 rounded-full bg-[#8E24AA] hover:bg-[#7B1FA2] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Thể lệ"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-9 sm:h-11 w-auto object-contain" />

          <div className="w-14" /> {/* Spacer cân xứng */}
        </div>

        {/* Hero Title Image: MỘT ĐIỂM ĐẾN MỞ ĐA TRẢI NGHIỆM (APP-21.svg) */}
        <div className="text-center space-y-2 pt-1">
          <CampaignBanner className="w-[88%] max-w-[320px] h-auto object-contain mx-auto drop-shadow-sm" />

          {/* Sub-banner: CÙNG AEON + Thời gian chương trình */}
          <div className="flex flex-col items-center justify-center space-y-1 pt-1">
            <div className="bg-[#10B981] text-white font-black text-xs px-4 py-0.5 rounded-full shadow-sm tracking-wider uppercase border border-emerald-400">
              CÙNG AEON
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-amber-300 text-[#92400E] font-bold text-[11px] px-3.5 py-0.5 rounded-full shadow-sm">
              Thời gian chương trình: <span className="font-extrabold text-[#B45309]">05 - 28.06.2026</span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 bg-red-100 border border-red-300 rounded-2xl flex items-start space-x-2 text-xs text-red-800 animate-fade-in mx-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Nhập Thông Tin (Thiết kế dạng viên thuốc bo tròn trắng như bản vẽ) */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-[320px] mx-auto w-full px-2">
          {/* Mục 1: Họ và Tên */}
          <div className="space-y-1.5 text-center">
            <label className="text-sm font-black text-[#991B1B] tracking-wider uppercase block">
              HỌ VÀ TÊN
            </label>
            <input
              type="text"
              required
              placeholder="Thy Phan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-3 px-6 bg-white rounded-full text-center font-bold text-gray-800 text-sm placeholder-gray-400 shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
            />
          </div>

          {/* Mục 2: Số Điện Thoại */}
          <div className="space-y-1.5 text-center">
            <label className="text-sm font-black text-[#991B1B] tracking-wider uppercase block">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              type="tel"
              required
              placeholder="0123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-3 px-6 bg-white rounded-full text-center font-bold text-gray-800 text-sm placeholder-gray-400 shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
            />
          </div>

          {/* Lưu ý kiểm tra thông tin */}
          <p className="text-[11px] font-bold text-gray-800 text-center leading-relaxed px-1 pt-1">
            Lưu ý: Quý khách vui lòng kiểm tra chính xác thông tin để đối chiếu khi nhận quà tại quầy nhé!
          </p>

          {/* Nút XÁC NHẬN dạng viên thuốc đỏ bóng 3D */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-14 py-2.5 bg-gradient-to-b from-[#EF4444] via-[#DC2626] to-[#B91C1C] hover:brightness-105 active:scale-95 text-white font-black text-base rounded-full shadow-lg border-2 border-red-300 tracking-wider transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'XÁC NHẬN'
              )}
            </button>
          </div>
        </form>

        {/* Thể lệ link */}
        <div className="text-center pt-1 z-20">
          <button
            type="button"
            onClick={onOpenRules}
            className="text-[11px] text-gray-700 font-bold hover:underline bg-white/60 px-3 py-0.5 rounded-full"
          >
            Xem thể lệ chương trình
          </button>
        </div>
      </div>

      {/* 3. Đồi cỏ xanh uốn lượn ở chân trang (Grass Hill) */}
      <div className="relative w-full h-24 pointer-events-none -mt-8 z-0">
        <svg
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,50 Q120,10 240,40 T400,30 L400,120 L0,120 Z"
            fill="#84CC16"
            opacity="0.8"
          />
          <path
            d="M0,65 Q150,25 280,60 T400,45 L400,120 L0,120 Z"
            fill="#65A30D"
          />
        </svg>
      </div>
    </div>
  );
};
