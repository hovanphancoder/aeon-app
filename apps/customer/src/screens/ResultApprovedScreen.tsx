import React from 'react';
import { CheckCircle2, Sparkles, Gift, ArrowRight, QrCode } from 'lucide-react';
import { Header } from '../components/Header';

interface ResultApprovedScreenProps {
  billData: any;
  onContinueAnother: () => void;
  onOpenRules: () => void;
}

export const ResultApprovedScreen: React.FC<ResultApprovedScreenProps> = ({
  billData,
  onContinueAnother,
  onOpenRules,
}) => {
  const activityName = billData?.activity?.name || 'WORKSHOP ĐẶC QUYỀN';
  const activityDesc = billData?.activity?.description || 'Trải nghiệm workshop và nhận quà tặng từ AEON Hải Dương.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title="Chúc Mừng Quý Khách" />

        <div className="p-4 space-y-6 pt-4">
          {/* Main Celebration Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 text-center shadow-lg space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>

            {/* Icon Success */}
            <div className="w-16 h-16 bg-white rounded-3xl text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                XÁC NHẬN THÀNH CÔNG
              </span>
              <h1 className="text-3xl font-black tracking-tight">
                CHÚC MỪNG!
              </h1>
              <p className="text-sm text-emerald-100 font-medium">
                Hóa đơn của bạn đã được phê duyệt hợp lệ.
              </p>
            </div>
          </div>

          {/* Ticket / Workshop Pass Card */}
          <div className="bg-white rounded-3xl p-6 shadow-card border-2 border-emerald-100 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-aeon-primary" />
                <span className="text-xs font-bold uppercase text-gray-500">
                  VÉ THAM GIA WORKSHOP
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                1 LƯỢT
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 leading-snug">
                {activityName}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {activityDesc}
              </p>
            </div>

            {/* Hướng dẫn Check-in với PG */}
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 text-left space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-aeon-primary">
                <Sparkles className="w-4 h-4 text-aeon-primary" />
                <span>Cách thức nhận quà / trải nghiệm:</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Vui lòng đưa màn hình này cho nhân viên PG tại quầy AEON Hải Dương để được check-in và nhận ngay phần quà của bạn!
              </p>
            </div>

            {/* Mã vé */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-gray-400 font-mono">
                MÃ PHIẾU: #{billData?.id?.slice(0, 10).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Nút Tiếp tục nộp bill khác */}
          <button
            onClick={onContinueAnother}
            className="w-full py-4 bg-gradient-to-r from-aeon-primary to-aeon-dark hover:opacity-95 text-white font-bold text-base rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all"
          >
            <span>Tham Gia Hoạt Động Khác</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 text-center">
        <p className="text-[11px] text-gray-400">
          Mỗi khách hàng được nộp nhiều hóa đơn và tham gia nhiều hoạt động khác nhau.
        </p>
      </div>
    </div>
  );
};
