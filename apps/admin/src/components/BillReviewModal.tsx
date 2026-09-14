import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ZoomIn, Calendar, Clock, User, Phone, Tag, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';

interface BillReviewModalProps {
  bill: any | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export const BillReviewModal: React.FC<BillReviewModalProps> = ({
  bill,
  onClose,
  onActionComplete,
}) => {
  const [adminNote, setAdminNote] = useState<string>(bill?.adminNote || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!bill) return null;

  // Xử lý URL hình ảnh linh hoạt:
  // Nếu là đường dẫn tương đối /uploads/... và có VITE_API_URL thì ghép vào
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : '';
    return `${baseUrl}${imagePath}`;
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError('');
      await adminApi.approveBill(bill.id, adminNote);
      onActionComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi phê duyệt hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      setError('Vui lòng nhập lý do từ chối vào ô Ghi chú để khách hàng nắm rõ.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await adminApi.rejectBill(bill.id, adminNote);
      onActionComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi từ chối hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(bill.submittedAt).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-aeon-primary text-white text-xs font-black px-2.5 py-1 rounded-lg">
              AEON
            </span>
            <div>
              <h3 className="font-bold text-base">Soi & Phê Duyệt Hóa Đơn</h3>
              <p className="text-xs text-slate-400">Mã Bill: #{bill.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Cột (Trái: Ảnh Bill lớn, Phải: Thông tin & Duyệt) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Cột trái: Ảnh Bill lớn */}
          <div className="md:col-span-7 bg-slate-950 rounded-2xl p-2 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden group">
            <img
              src={getFullImageUrl(bill.billImage)}
              alt="Hóa đơn mua sắm"
              className={`max-h-[500px] w-auto object-contain rounded-xl transition-all duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center space-x-1.5"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{isZoomed ? 'Thu nhỏ ảnh' : 'Phóng to ảnh'}</span>
            </button>
          </div>

          {/* Cột phải: Thông tin khách & Form duyệt */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  THÔNG TIN KHÁCH HÀNG & LƯỢT NỘP
                </span>
                <h4 className="text-lg font-black text-gray-900 leading-tight">
                  {bill.customer?.name || 'Khách hàng'}
                </h4>
              </div>

              {/* Chi tiết thông tin */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-4 h-4 text-aeon-primary shrink-0" />
                  <span>SĐT: <strong className="font-bold text-gray-900 text-sm">{bill.customer?.phone}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Tháng: <strong className="font-bold text-gray-900">{bill.month?.name}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Tag className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Hoạt động: <strong className="font-bold text-aeon-primary">{bill.activity?.name}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Gửi lúc: <strong className="font-medium text-gray-800">{formattedDate}</strong></span>
                </div>
              </div>

              {/* Trạng thái hiện tại */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Trạng thái:</span>
                <span
                  className={`px-3 py-1 text-xs font-black rounded-full uppercase ${
                    bill.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : bill.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {bill.status === 'approved'
                    ? 'ĐÃ CHẤP NHẬN'
                    : bill.status === 'rejected'
                    ? 'ĐÃ TỪ CHỐI'
                    : 'CHỜ DUYỆT'}
                </span>
              </div>

              {/* Ô nhập ghi chú / lý do */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Ghi Chú Phê Duyệt / Lý Do Từ Chối:
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ví dụ: Hóa đơn hợp lệ 350.000đ / Hóa đơn mờ số tiền..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-aeon-primary focus:bg-white resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* 2 Nút Hành động cốt lõi: CHẤP NHẬN & TỪ CHỐI */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              {/* Nút TỪ CHỐI */}
              <button
                onClick={handleReject}
                disabled={loading}
                className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-2xl flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>TỪ CHỐI</span>
              </button>

              {/* Nút CHẤP NHẬN */}
              <button
                onClick={handleApprove}
                disabled={loading}
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CHẤP NHẬN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
