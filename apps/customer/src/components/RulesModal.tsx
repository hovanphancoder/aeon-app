import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AeonLogo } from './AeonLogo';
import workshopTitleImg from '../assets/APP-24.png';
import bgImage from '../assets/bg-app-19.png';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-[420px] min-h-screen relative flex flex-col justify-between overflow-x-hidden shadow-2xl bg-cover bg-top bg-no-repeat px-4 py-3 pb-6 select-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Top Section: Header & Tiêu đề chương trình chuẩn ảnh mẫu */}
        <div className="space-y-1">
          {/* Row 1: Back arrow + Logo AEON Hải Dương */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

            <div className="w-11" /> {/* Cân đối */}
          </div>

          {/* Tiêu đề chính thức WORKSHOP CHO NÀNG & Huy hiệu thời gian */}
          <div className="text-center flex flex-col items-center pt-0.5">
            <img
              src={workshopTitleImg}
              alt="Workshop Cho Nàng"
              className="w-56 sm:w-64 max-w-[80%] h-auto object-contain drop-shadow-sm select-none pointer-events-none"
            />

            <div className="inline-block bg-[#FFF574] text-center px-4 py-0.5 rounded-2xl shadow-sm border border-amber-200 leading-tight mt-0.5">
              <p className="text-[10px] sm:text-[11px] font-black text-[#5C1D82] uppercase tracking-wide">
                THỜI GIAN CHƯƠNG TRÌNH:
              </p>
              <p className="text-[11px] sm:text-[12px] font-black text-[#E60067] tracking-wider">
                18 - 20.10.2026
              </p>
            </div>
          </div>
        </div>

        {/* Khung Thẻ Thể Lệ Màu Trắng Bo Tròn Chuẩn Ảnh Mẫu 1 */}
        <div className="my-auto w-full max-w-[350px] mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-xl border border-pink-100 text-left space-y-3">
          {/* 1. NAIL XINH TẶNG NÀNG */}
          <div className="space-y-1">
            <h2 className="text-[#E60067] font-black text-xs sm:text-sm uppercase tracking-wide">
              NAIL XINH TẶNG NÀNG
            </h2>
            <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800 space-y-1 leading-snug">
              <p>
                - Áp dụng cho khách hàng có hóa đơn mua hàng từ{' '}
                <strong className="font-black text-gray-900">300.000 VNĐ</strong> tại gian hàng (không áp dụng cho hóa đơn từ siêu thị).
              </p>
              <p>
                - Quét QR để vào website chương trình, cung cấp hóa đơn và cập nhật hình ảnh lên website. Khi hóa đơn được xác minh hợp lệ, hệ thống sẽ tự động gửi{' '}
                <strong className="font-black text-gray-900">01 lượt tham gia workshop</strong> về màn hình cho khách hàng.
              </p>
              <div className="bg-[#FFD9E8] px-1.5 py-0.5 rounded inline-block text-[9.5px] sm:text-[10px] font-bold text-gray-900 leading-tight mt-0.5">
                <em>Lưu ý: Ưu tiên khách hàng đến sớm. Số lượng quà tặng có giới hạn 150 phần/ngày</em>
              </div>
            </div>
          </div>

          {/* 2. NÉT ĐIỆU CHO NÀNG */}
          <div className="space-y-1 pt-1 border-t border-gray-100">
            <h2 className="text-[#008A38] font-black text-xs sm:text-sm uppercase tracking-wide">
              NÉT ĐIỆU CHO NÀNG
            </h2>
            <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800 space-y-1 leading-snug">
              <p>
                - Áp dụng cho khách hàng có hóa đơn mua hàng từ{' '}
                <strong className="font-black text-gray-900">300.000 VNĐ</strong> tại gian hàng (không áp dụng cho hóa đơn từ siêu thị).
              </p>
              <p>
                - Quét QR để vào website chương trình, cung cấp hóa đơn và cập nhật hình ảnh lên website. Khi hóa đơn được xác minh hợp lệ, hệ thống sẽ tự động gửi{' '}
                <strong className="font-black text-gray-900">01 lượt tham gia workshop</strong> về màn hình cho khách hàng.
              </p>
              <div className="bg-[#FFD9E8] px-1.5 py-0.5 rounded inline-block text-[9.5px] sm:text-[10px] font-bold text-gray-900 leading-tight mt-0.5">
                <em>Lưu ý: Chương trình ưu tiên khách hàng đến sớm và đã xác nhận lịch hẹn theo khung giờ</em>
              </div>
            </div>
          </div>

          {/* Ghi chú chung in hoa màu hồng */}
          <div className="text-center pt-1.5 border-t border-gray-100 text-[8.5px] sm:text-[9.5px] font-black text-[#E60067] leading-tight space-y-0.5">
            <p>★ MỖI HÓA ĐƠN HỢP LỆ ĐƯỢC THAM GIA 1 LẦN/ 1 HOẠT ĐỘNG ★</p>
            <p>KHÔNG GIỚI HẠN SỐ LƯỢT THAM GIA NẾU HÓA ĐƠN HỢP LỆ</p>
            <p>(KHÔNG TÁCH BILL DƯỚI MỌI HÌNH THỨC)</p>
          </div>

          {/* Nút QUAY LẠI màu xanh lá cây viên thuốc */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-1.5 bg-gradient-to-b from-[#8CD825] via-[#70C922] to-[#4F9E13] hover:brightness-105 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-md border border-white/60 tracking-wider uppercase transition-all"
            >
              QUAY LẠI
            </button>
          </div>
        </div>

        {/* Khoảng đệm phía dưới để hoa hướng dương và bóng bay của nền hiển thị */}
        <div className="h-4 pointer-events-none" />
      </div>
    </div>
  );
};
