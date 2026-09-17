import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Upload,
  AlertCircle,
  CameraOff,
  SwitchCamera,
  RotateCw,
  Camera,
} from 'lucide-react';
import { api } from '../api/client';
import { ActivityItem } from './ActivitySelectionScreen';
import { AeonLogo } from '../components/AeonLogo';

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
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dừng luồng camera hiện tại
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Bật camera thực tế
  const startCamera = useCallback(
    async (mode: 'environment' | 'user' = facingMode) => {
      stopCamera();
      setCameraLoading(true);
      setCameraError('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Trình duyệt của bạn không hỗ trợ truy cập máy ảnh trực tiếp.');
        }

        // Kiểm tra xem thiết bị có nhiều hơn 1 camera không (để hiện nút đổi camera)
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        } catch {
          // Bỏ qua nếu trình duyệt chưa cấp quyền enumerateDevices
        }

        // Ưu tiên độ phân giải cao và camera theo mode (mặc định 'environment' = camera sau)
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
            },
            audio: false,
          });
        } catch {
          // Dự phòng nếu thiết bị không hỗ trợ constraint lý tưởng
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setCameraActive(true);
        setCameraLoading(false);
      } catch (err: any) {
        console.error('[Camera Error]:', err);
        stopCamera();
        setCameraLoading(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Bạn chưa cấp quyền truy cập máy ảnh. Vui lòng cho phép quyền Camera trong trình duyệt để chụp hóa đơn.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('Không tìm thấy thiết bị camera trên máy của bạn.');
        } else {
          setCameraError('Không thể mở camera: ' + (err.message || 'Vui lòng kiểm tra lại thiết bị.'));
        }
      }
    },
    [facingMode, stopCamera]
  );

  // Tự động bật camera khi mở màn hình
  useEffect(() => {
    if (!previewUrl) {
      startCamera(facingMode);
    }

    return () => {
      stopCamera();
    };
  }, [facingMode, previewUrl, startCamera, stopCamera]);

  // Gắn lại stream nếu video element được re-mount
  useEffect(() => {
    if (videoRef.current && streamRef.current && !previewUrl) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [previewUrl]);

  // Đổi giữa camera sau và camera trước
  const toggleCameraFacing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Chụp ảnh trực tiếp từ luồng video của Camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    // Hiệu ứng chớp flash khi bấm chụp
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;
    canvas.width = vWidth;
    canvas.height = vHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, vWidth, vHeight);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `bill-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  // Chụp lại (Hủy ảnh preview, mở lại camera trực tiếp)
  const handleRetake = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Gửi ảnh hóa đơn đã chụp lên server
  const handleSubmit = async () => {
    if (!selectedFile) {
      setCameraError('Vui lòng chụp ảnh hóa đơn trước khi gửi duyệt.');
      return;
    }

    try {
      setLoading(true);
      setCameraError('');
      const res = await api.submitBill(activity.id, selectedFile);

      if (res.data?.id) {
        onSuccess(res.data.id);
      } else {
        throw new Error(res.message || 'Không nhận được mã hóa đơn từ máy chủ.');
      }
    } catch (err: any) {
      console.error('[Submit Bill Error]:', err);
      setCameraError(err.message || 'Lỗi gửi hóa đơn lên máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Định dạng tên hoạt động thành 2 dòng (ví dụ: NAIL XINH / TẶNG NÀNG)
  const formatTitle = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length <= 2) return [name.toUpperCase()];
    const mid = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, mid).join(' ').toUpperCase(),
      parts.slice(mid).join(' ').toUpperCase(),
    ];
  };

  const titleLines = formatTitle(activity.name);
  return (
    <div className="relative w-full min-h-screen flex-1 overflow-hidden flex flex-col justify-between select-none bg-transparent p-4 pb-6">
      {/* Hidden canvas để chụp frame từ video */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Section */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Row 1: Back button tím hồng + Logo AEON ở giữa */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            className="w-11 h-6 sm:w-12 sm:h-7 rounded-full bg-[#A82485] hover:bg-[#8E1C70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-7 sm:h-8 w-auto object-contain" />

          <div className="w-11" />
        </div>

        {/* Row 2: Tên hoạt động & Thời gian chương trình chuẩn ảnh mẫu 1 */}
        <div className="text-center pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#E60067] tracking-wider uppercase leading-tight">
            {titleLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </h1>

          {/* Sub-badge thời gian vàng nghệ */}
          <div className="inline-block bg-[#FFE600] text-[#002D5A] font-extrabold text-[9px] sm:text-[10px] px-3.5 py-0.5 rounded-full border border-amber-300 shadow-sm uppercase tracking-wide mt-1">
            THỜI GIAN CHƯƠNG TRÌNH: 18 - 20.10.2026
          </div>
        </div>

        {/* Hiển thị thông báo lỗi nếu có */}
        {cameraError && (
          <div className="p-2.5 bg-red-100 border border-red-300 rounded-xl flex items-start space-x-2 text-xs text-red-800 animate-fade-in mx-auto max-w-[280px]">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Center: KHUNG CAMERA VIỀN HỒNG BO GÓC TRÒN CHUẨN ẢNH MẪU 1 */}
        <div className="pt-1 flex flex-col items-center">
          <div
            onClick={() => {
              if (cameraActive && !previewUrl) {
                capturePhoto();
              }
            }}
            className="w-[86%] max-w-[280px] h-[330px] sm:h-[350px] border-2 border-[#E60067] rounded-3xl bg-white relative flex flex-col items-center justify-center overflow-hidden shadow-md cursor-pointer"
          >
            {/* 1. MÀN HÌNH XEM TRƯỚC ẢNH ĐÃ CHỤP */}
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={previewUrl}
                  alt="Ảnh hóa đơn đã chụp"
                  className="w-full h-full object-contain"
                />

                {/* Nút Chụp lại */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetake();
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-full flex items-center space-x-1 shadow border border-white/20 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Chụp lại</span>
                </button>

                {/* Badge trạng thái ảnh */}
                <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                    ✓ Đã chụp thành công
                  </span>
                </div>
              </div>
            ) : (
              /* 2. KHUNG LIVE CAMERA THỰC TẾ */
              <div className="relative w-full h-full flex items-center justify-center bg-white">
                {/* Thẻ Video phát luồng camera thực tế */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                />

                {/* Hiệu ứng chớp Flash khi bấm chụp */}
                {isFlashActive && (
                  <div className="absolute inset-0 bg-white z-20 pointer-events-none animate-ping" />
                )}

                {/* TRẠNG THÁI: CAMERA ĐANG HOẠT ĐỘNG */}
                {cameraActive && (
                  <>
                    {/* Nút chuyển đổi Camera trước / sau (nếu có) */}
                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="absolute top-2.5 left-2.5 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-sm active:scale-90 transition-all border border-white/20"
                        title="Đổi camera trước / sau"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    )}

                    {/* Nút Bấm Máy Ảnh Tròn Màu Hồng Viền Trắng Đặt Ngay Đáy Khung Chuẩn Mẫu 1 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        capturePhoto();
                      }}
                      className="absolute bottom-3 w-12 h-12 rounded-full bg-gradient-to-b from-[#FF2D78] via-[#E60067] to-[#C00054] border-2 border-white shadow-lg flex items-center justify-center text-white active:scale-90 hover:scale-105 transition-all z-20"
                      title="Chụp ảnh hóa đơn"
                    >
                      <Camera className="w-6 h-6 stroke-[2.2]" />
                    </button>
                  </>
                )}

                {/* TRẠNG THÁI: ĐANG KẾT NỐI CAMERA */}
                {cameraLoading && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/40 p-4 text-center space-y-2 z-10">
                    <RotateCw className="w-7 h-7 text-[#E60067] animate-spin" />
                    <p className="text-xs font-bold text-gray-700">
                      Đang kết nối camera...
                    </p>
                  </div>
                )}

                {/* TRẠNG THÁI: LỖI / CHƯA CẤP QUYỀN CAMERA */}
                {!cameraLoading && !cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/60 p-4 text-center space-y-2.5 z-10">
                    <CameraOff className="w-8 h-8 text-gray-500" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-[#E60067] uppercase">
                        Chưa kết nối camera
                      </p>
                      <p className="text-[10px] text-gray-600 leading-tight">
                        Vui lòng cho phép quyền Camera để chụp trực tiếp hóa đơn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera(facingMode);
                      }}
                      className="px-3.5 py-1 bg-[#E60067] text-white text-[11px] font-bold rounded-full active:scale-95 transition-all shadow"
                    >
                      Bật lại camera
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dòng ghi chú bên dưới khung ảnh chuẩn mẫu 1 */}
          <p className="text-[9px] sm:text-[10px] font-bold text-black text-center max-w-[260px] mx-auto mt-2 leading-tight">
            Vui lòng tải lên ảnh hóa đơn. Đảm bảo ảnh chụp rõ nét, đầy đủ thông tin và tổng tiền
          </p>

          {/* Nút Xác Nhận Nộp Hóa Đơn khi đã chụp */}
          {previewUrl && (
            <div className="w-[86%] max-w-[280px] mt-2 animate-fade-in">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-b from-[#FF2D78] via-[#E60067] to-[#C00054] hover:brightness-105 text-white font-black text-xs sm:text-sm rounded-full shadow-lg border-2 border-white/60 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-60 uppercase tracking-wider"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>XÁC NHẬN GỬI HÓA ĐƠN</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Nút THỂ LỆ Màu Xanh Lá Cây Viên Thuốc Chuẩn Mẫu 1 */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenRules}
            className="px-12 py-1.5 bg-gradient-to-b from-[#8CD825] via-[#70C922] to-[#4F9E13] hover:brightness-105 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-md border border-white/60 tracking-wider uppercase transition-all"
          >
            THỂ LỆ
          </button>
        </div>
      </div>
    </div>
  );
};

