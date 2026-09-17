import React from 'react';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';

interface ComingSoonScreenProps {
  monthName: string;
  onBack: () => void;
  onOpenRules: () => void;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  monthName,
  onBack,
  onOpenRules,
}) => {
  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent">
      <div>
        <Header onOpenRules={onOpenRules} title="Chương Trình Sắp Diễn Ra" />

        <div className="p-4 space-y-6">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-aeon-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại chọn tháng khác</span>
          </button>

          {/* Coming Soon Showcase Card */}
          <div className="bg-white rounded-3xl p-8 shadow-card border border-rose-100/70 text-center space-y-5">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-amber-100/80 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg mx-auto">
                <Clock className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full tracking-wider">
                COMING SOON
              </span>
              <h1 className="text-2xl font-black text-gray-900">
                {monthName}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Các hoạt động workshop và quà tặng đặc sắc của{' '}
                <strong className="text-aeon-primary font-bold">{monthName}</strong>{' '}
                đang được chuẩn bị và sẽ sớm ra mắt quý khách!
              </p>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 text-left space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-aeon-primary">
                <Sparkles className="w-4 h-4" />
                <span>Bật mí sắp tới:</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nhiều hoạt động hấp dẫn và quà tặng bất ngờ đang chờ đón quý khách tại AEON Hải Dương. Vui lòng quay lại trong tháng hoặc tham gia tháng đang diễn ra nhé!
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full py-3.5 bg-aeon-primary hover:bg-aeon-dark text-white font-bold rounded-2xl shadow-aeon btn-active-scale transition-all"
            >
              Xem Tháng Đang Diễn Ra
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        <p className="text-[11px] text-gray-400">
          Theo dõi fanpage AEON Hải Dương để nhận thông báo mới nhất!
        </p>
      </div>
    </div>
  );
};
