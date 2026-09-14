import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, ArrowLeft, Upload, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { ActivityItem } from './ActivitySelectionScreen';

interface BillUploadScreenProps {
  activity: ActivityItem;
  onSuccess: (billId: string) => void;
  onBack: () => void;
  onOpenRules: () => void;
}

export const BillUploadScreen: React.FC<BillUploadScreenProps> = ({
  activity,
  onSuccess,
  onBack,
  onOpenRules,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Tệp được chọn không phải là hình ảnh hợp lệ.');
      return;
    }

    // Kiểm tra dung lượng (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 10MB).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chụp ảnh hoặc chọn ảnh hóa đơn trước khi gửi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await api.submitBill(activity.id, selectedFile);

      if (res.data?.id) {
        onSuccess(res.data.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi tải hóa đơn lên.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <Header onOpenRules={onOpenRules} title="Tải Lên Hóa Đơn" />

        <div className="p-4 space-y-5">
          {/* Nút Quay lại */}
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-aeon-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn hoạt động khác</span>
          </button>

          {/* Activity Mini Banner */}
          <div className="bg-rose-50 border border-rose-100/90 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-aeon-primary tracking-wider">
                HOẠT ĐỘNG ĐÃ CHỌN
              </span>
              <h2 className="text-sm font-extrabold text-gray-900 leading-tight">
                {activity.name}
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-white text-aeon-primary font-bold text-[11px] rounded-lg shadow-sm">
              1 Lượt
            </span>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-100/70 space-y-5">
            <div className="space-y-1">
              <h1 className="text-lg font-black text-gray-900">
                Vui Lòng Up Ảnh Hóa Đơn Của Bạn
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Chụp hoặc chọn ảnh hóa đơn mua sắm rõ nét (đầy đủ ngày, giờ, tổng tiền).
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Hidden Input File Elements */}
            {/* 1. Chụp ảnh trực tiếp với camera sau */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* 2. Chọn ảnh từ thư viện máy */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Khung Xem trước hoặc Nút Chọn */}
            {previewUrl ? (
              <div className="space-y-4 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden border-2 border-aeon-primary/30 bg-black max-h-80 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview Hóa đơn"
                    className="max-h-80 w-auto object-contain rounded-xl"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1.5">
                    <button
                      onClick={handleClearImage}
                      type="button"
                      className="px-3 py-1 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-sm flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Chụp lại</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ảnh hóa đơn đã sẵn sàng để gửi phê duyệt!</span>
                </div>

                {/* Nút gửi bill */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-aeon-primary to-aeon-dark hover:opacity-95 text-white font-black text-base rounded-2xl shadow-aeon flex items-center justify-center space-x-2 btn-active-scale transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>XÁC NHẬN GỬI HÓA ĐƠN</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 2 Lựa chọn: Camera & Thư viện */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Nút 1: Chụp bằng Camera */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 hover:bg-rose-100/60 flex flex-col items-center justify-center space-y-2 transition-all btn-active-scale text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-aeon-primary text-white flex items-center justify-center shadow-md">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      Chụp Ảnh Mới
                    </span>
                    <span className="text-[10px] text-gray-500">Mở Camera Điện Thoại</span>
                  </button>

                  {/* Nút 2: Tải từ máy */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/80 flex flex-col items-center justify-center space-y-2 transition-all btn-active-scale text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-md">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      Chọn Từ Thư Viện
                    </span>
                    <span className="text-[10px] text-gray-500">Tải ảnh có sẵn</span>
                  </button>
                </div>

                {/* Hướng dẫn chụp ảnh hóa đơn */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <span className="font-bold text-gray-800 block">💡 Mẹo chụp ảnh rõ nét:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Đặt hóa đơn trên mặt phẳng đủ ánh sáng.</li>
                    <li>Chụp rõ nét phần ngày mua hàng và tổng số tiền.</li>
                    <li>Không chụp góc bị mất thông tin hoặc bị lóa sáng.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        <button
          onClick={onOpenRules}
          className="text-xs text-aeon-primary font-bold hover:underline"
        >
          Xem Thể Lệ Hóa Đơn Hợp Lệ
        </button>
      </div>
    </div>
  );
};
