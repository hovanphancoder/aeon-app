import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle2,
  CameraOff,
  SwitchCamera,
  RotateCw,
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
      <div className="space-y-3 sm:space-y-4">
        {/* Row 1: Back button + LOGO Badge */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            className="w-14 h-8 rounded-full bg-[#8E24AA] hover:bg-[#7B1FA2] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Logo AEON Hải Dương chính thức */}
          <AeonLogo className="h-9 sm:h-11 w-auto object-contain" />

          <div className="w-14" />
        </div>

        {/* Row 2: Tên hoạt động */}
        <div className="text-center pt-1">
          <div className="inline-block bg-[#FF4081] text-black font-black text-base sm:text-lg px-8 py-2 rounded-3xl shadow-sm border border-pink-400 leading-tight">
            {titleLines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>

          {/* Hướng dẫn chụp ảnh trực tiếp */}
          <p className="text-xs text-gray-800 font-semibold tracking-normal mt-2">
            Đưa hóa đơn vào khung và chụp trực tiếp
          </p>
        </div>

        {/* Hiển thị thông báo lỗi nếu có */}
        {cameraError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-start space-x-2 text-xs text-red-800 animate-fade-in mx-auto max-w-[320px]">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Center: KHUNG CAMERA THỰC TẾ (Viền đen chuẩn theo bản vẽ) */}
        <div className="pt-1 flex justify-center">
          <div
            onClick={() => {
              if (cameraActive && !previewUrl) {
                capturePhoto();
              }
            }}
            className="w-[92%] max-w-[310px] h-[360px] sm:h-[390px] border-[2.5px] border-black bg-black relative flex flex-col items-center justify-center overflow-hidden shadow-inner cursor-pointer"
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
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-full flex items-center space-x-1 shadow-md border border-white/20 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
              <div className="relative w-full h-full flex items-center justify-center bg-black">
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
                    {/* 4 góc ngắm canh khung hóa đơn */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white pointer-events-none" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white pointer-events-none" />

                    {/* Vạch căn chỉnh tài liệu mờ ở giữa */}
                    <div className="absolute inset-x-6 inset-y-10 border border-dashed border-white/40 rounded pointer-events-none" />

                    {/* Nút chuyển đổi Camera trước / sau (nếu thiết bị có nhiều camera) */}
                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="absolute top-2.5 left-2.5 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-sm active:scale-90 transition-all border border-white/20"
                        title="Đổi camera trước / sau"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    )}

                    {/* Hướng dẫn bấm vào khung */}
                    <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none">
                      <span className="bg-black/70 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                        ● Chạm vào đây hoặc nút máy ảnh để chụp
                      </span>
                    </div>
                  </>
                )}

                {/* TRẠNG THÁI: ĐANG KẾT NỐI CAMERA */}
                {cameraLoading && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#C2D1DD] p-4 text-center space-y-3 z-10">
                    <RotateCw className="w-8 h-8 text-gray-700 animate-spin" />
                    <p className="text-xs font-bold text-gray-800">
                      Đang kết nối camera thực tế...
                    </p>
                  </div>
                )}

                {/* TRẠNG THÁI: LỖI / CHƯA CẤP QUYỀN CAMERA */}
                {!cameraLoading && !cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#C2D1DD] p-4 text-center space-y-3 z-10">
                    <CameraOff className="w-10 h-10 text-gray-600" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-black uppercase">
                        Chưa kết nối được camera
                      </p>
                      <p className="text-[11px] text-gray-700 leading-tight">
                        Vui lòng cho phép quyền truy cập máy ảnh để chụp trực tiếp hóa đơn (không dùng ảnh tải lên).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera(facingMode);
                      }}
                      className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full active:scale-95 transition-all shadow"
                    >
                      Bật lại camera
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NÚT BẤM CHỤP ẢNH & XÁC NHẬN */}
        <div className="flex flex-col items-center justify-center pt-1 space-y-3">
          {/* Nút biểu tượng Máy Ảnh (Chỉ hiện khi chưa chụp hoặc đang bật camera) */}
          {!previewUrl && (
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!cameraActive}
              className="w-16 h-12 flex items-center justify-center text-black hover:opacity-80 active:scale-90 transition-all disabled:opacity-40"
              title="Bấm để chụp ảnh hóa đơn"
            >
              <svg
                viewBox="0 0 48 40"
                className="w-12 h-10 stroke-black fill-none stroke-[2.5]"
              >
                {/* Thân máy ảnh */}
                <rect x="3" y="10" width="42" height="27" rx="5" />
                {/* Vòng ống kính ở giữa */}
                <circle cx="24" cy="23.5" r="7.5" />
                {/* Tâm ống kính */}
                <circle cx="24" cy="23.5" r="3" fill="currentColor" />
                {/* Nút bấm / gờ phía trên */}
                <path d="M15 10 L18 5 L30 5 L33 10 Z" />
                {/* Đèn báo nhỏ */}
                <circle cx="37" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </button>
          )}

          {/* Nút Xác Nhận Nộp Hóa Đơn khi đã chụp */}
          {previewUrl && (
            <div className="w-[92%] max-w-[310px] space-y-2 animate-fade-in">
              <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Hóa đơn đã chụp sẵn sàng gửi duyệt!</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-60"
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
      </div>

      {/* Bottom Section: Nút THỂ LỆ */}
      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={onOpenRules}
          className="px-14 py-2 bg-[#005E8A] hover:bg-[#004768] text-white font-extrabold text-sm rounded-full shadow-md active:scale-95 transition-all border border-sky-900/40"
        >
          thể lệ
        </button>
      </div>
    </div>
  );
};

