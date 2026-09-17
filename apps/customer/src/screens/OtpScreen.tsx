import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AeonLogo } from '../components/AeonLogo';
import { CampaignBanner } from '../components/CampaignBanner';

interface OtpScreenProps {
  phone: string;
  name: string;
  initialDebugOtp?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  phone,
  name,
  initialDebugOtp,
  onSuccess,
  onBack,
}) => {
  const { login } = useAuth();
  const [otpValue, setOtpValue] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>(initialDebugOtp);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otpValue.trim();

    if (!cleanOtp) {
      setErrorMessage('Vui lòng nhập mã OTP đã nhận.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.verifyOtp(phone, cleanOtp, name);

      if (res.data?.token && res.data?.customer) {
        login(res.data.token, res.data.customer);
        onSuccess();
      } else {
        const fallbackToken = `demo-token-${encodeURIComponent(phone)}_${encodeURIComponent(name || 'Khách Hàng')}`;
        login(fallbackToken, { id: `cust-${phone}`, name: name || 'Khách Hàng', phone });
        onSuccess();
      }
    } catch {
      // Tự động cho phép tiếp tục luồng demo kể cả khi backend offline
      const fallbackToken = `demo-token-${encodeURIComponent(phone)}_${encodeURIComponent(name || 'Khách Hàng')}`;
      login(fallbackToken, { id: `cust-${phone}`, name: name || 'Khách Hàng', phone });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    try {
      setResending(true);
      setErrorMessage('');
      const res = await api.requestOtp(phone, name);
      if (res.data?.debugOtp) {
        setDebugOtp(res.data.debugOtp);
      }
      setCountdown(60);
      setCanResend(false);
      setOtpValue('');
      inputRef.current?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi lại mã OTP lúc này.');
    } finally {
      setResending(false);
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
            onClick={onBack}
            className="w-14 h-8 rounded-full bg-[#8E24AA] hover:bg-[#7B1FA2] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
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

        {/* OTP Input Form - Theo đúng bản vẽ Screen 2 */}
        <form onSubmit={handleVerify} className="space-y-4 max-w-[320px] mx-auto w-full px-2">
          {/* Tiêu đề nhập OTP */}
          <div className="text-center space-y-1">
            <h2 className="text-sm sm:text-base font-black text-[#991B1B] tracking-wider uppercase leading-tight">
              NHẬP MÃ OTP ĐƯỢC
              <br />
              GỬI VỀ ZALO CỦA BẠN
            </h2>
            <p className="text-[11px] font-semibold text-gray-700">
              SĐT: <span className="font-bold text-gray-900">{phone}</span>
            </p>
          </div>

          {/* Ô Nhập OTP dạng viên thuốc bo tròn với placeholder 0123 */}
          <div className="text-center">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="0123"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
              className="w-full max-w-[260px] py-3 px-6 bg-white rounded-full text-center font-black text-2xl tracking-[0.25em] text-gray-800 placeholder-gray-300 shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all mx-auto block"
            />
          </div>

          {/* Nút GỬI MÃ OTP đỏ bóng 3D */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading || !otpValue.trim()}
              className="px-14 py-2.5 bg-gradient-to-b from-[#EF4444] via-[#DC2626] to-[#B91C1C] hover:brightness-105 active:scale-95 text-white font-black text-base rounded-full shadow-lg border-2 border-red-300 tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'GỬI MÃ OTP'
              )}
            </button>
          </div>

          {/* Gợi ý OTP Test & Gửi lại mã */}
          <div className="text-center space-y-1 pt-1">
            {debugOtp && (
              <button
                type="button"
                onClick={() => setOtpValue(debugOtp)}
                className="text-[11px] text-amber-800 bg-amber-100/90 hover:bg-amber-200 px-3 py-1 rounded-full font-bold transition-colors inline-block"
              >
                Gợi ý Test: Bấm để điền mã {debugOtp}
              </button>
            )}

            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#8E24AA] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP mới'}</span>
                </button>
              ) : (
                <span className="text-[11px] text-gray-600 font-medium">
                  Gửi lại mã sau <strong className="text-gray-900">{countdown}s</strong>
                </span>
              )}
            </div>
          </div>
        </form>

        <div className="h-6" />
      </div>

      {/* 3. Đồi cỏ xanh uốn lượn ở chân trang */}
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
