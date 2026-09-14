import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

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
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>(initialDebugOtp);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus ô đầu tiên khi mở màn hình
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputsRef.current[5]?.focus();
    }
  };

  // Xác nhận OTP
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.verifyOtp(phone, otpValue, name);

      if (res.data?.token && res.data?.customer) {
        // Lưu phiên đăng nhập 24h
        login(res.data.token, res.data.customer);
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã OTP
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
      setOtp(new Array(6).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi lại mã OTP lúc này.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/40 flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="space-y-6 pt-4">
        {/* Nút Quay lại */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-aeon-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thay đổi số điện thoại</span>
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-rose-100 text-aeon-primary rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Xác Thực OTP</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Mã xác thực đã được gửi tới số điện thoại Zalo:
            <br />
            <strong className="text-gray-900 font-bold text-sm tracking-wide">{phone}</strong>
          </p>
        </div>

        {/* Hộp gợi ý OTP cho môi trường Dev / Mock */}
        {debugOtp && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1 animate-fade-in">
            <p className="text-[11px] text-amber-800 font-medium">
              [Chế độ thử nghiệm Mock ZNS]
            </p>
            <p className="text-xs text-amber-900 font-bold">
              Mã OTP của bạn là: <span className="font-mono text-base text-aeon-primary tracking-widest">{debugOtp}</span>
            </p>
          </div>
        )}

        {/* Form nhập 6 ô OTP */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-100/60 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between space-x-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                  digit
                    ? 'border-aeon-primary bg-rose-50/50 text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-aeon-primary focus:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Nút Xác nhận */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-aeon-primary to-aeon-dark hover:opacity-95 text-white font-bold rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận OTP</span>
              </>
            )}
          </button>

          {/* Gửi lại OTP */}
          <div className="text-center pt-2">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-aeon-primary hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP mới'}</span>
              </button>
            ) : (
              <p className="text-xs text-gray-400">
                Gửi lại mã sau <span className="font-bold text-gray-700">{countdown}s</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="py-4 text-center">
        <p className="text-[11px] text-gray-400">
          Phiên đăng nhập được duy trì trong 24 giờ trên thiết bị này.
        </p>
      </div>
    </div>
  );
};
