import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { RulesModal } from './components/RulesModal';
import { LoadingSpinner } from './components/LoadingSpinner';

// 9 Screens
import { RegisterScreen } from './screens/RegisterScreen';
import { OtpScreen } from './screens/OtpScreen';
import { MonthSelectionScreen } from './screens/MonthSelectionScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { ActivitySelectionScreen, ActivityItem } from './screens/ActivitySelectionScreen';
import { BillUploadScreen } from './screens/BillUploadScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { ResultApprovedScreen } from './screens/ResultApprovedScreen';
import { ResultRejectedScreen } from './screens/ResultRejectedScreen';

type ScreenState = 
  | 'REGISTER'
  | 'OTP'
  | 'MONTHS'
  | 'COMING_SOON'
  | 'ACTIVITIES'
  | 'UPLOAD'
  | 'WAITING'
  | 'APPROVED'
  | 'REJECTED';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('REGISTER');
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Transient Flow States
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<any | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [currentBillId, setCurrentBillId] = useState<string>('');
  const [reviewedBillData, setReviewedBillData] = useState<any | null>(null);

  // Nhận diện session 24 giờ: Nếu đã đăng nhập thì tự động vào màn hình Chọn Tháng
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Tránh ghi đè nếu khách đang ở các bước nộp bill
        if (currentScreen === 'REGISTER' || currentScreen === 'OTP') {
          setCurrentScreen('MONTHS');
        }
      } else {
        setCurrentScreen('REGISTER');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <LoadingSpinner text="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col justify-center">
      {/* 1. Đăng ký Họ tên & SĐT */}
      {currentScreen === 'REGISTER' && (
        <RegisterScreen
          onOpenRules={() => setIsRulesOpen(true)}
          onSuccess={(enteredPhone, enteredName, otpHint) => {
            setPhone(enteredPhone);
            setName(enteredName);
            setDebugOtp(otpHint);
            setCurrentScreen('OTP');
          }}
        />
      )}

      {/* 2. Nhập mã OTP */}
      {currentScreen === 'OTP' && (
        <OtpScreen
          phone={phone}
          name={name}
          initialDebugOtp={debugOtp}
          onBack={() => setCurrentScreen('REGISTER')}
          onSuccess={() => setCurrentScreen('MONTHS')}
        />
      )}

      {/* 3. Chọn Tháng */}
      {currentScreen === 'MONTHS' && (
        <MonthSelectionScreen
          onOpenRules={() => setIsRulesOpen(true)}
          onSelectActiveMonth={(month) => {
            setSelectedMonth(month);
            setCurrentScreen('ACTIVITIES');
          }}
          onSelectComingSoonMonth={(month) => {
            setSelectedMonth(month);
            setCurrentScreen('COMING_SOON');
          }}
        />
      )}

      {/* 4. Tháng Coming Soon */}
      {currentScreen === 'COMING_SOON' && selectedMonth && (
        <ComingSoonScreen
          monthName={selectedMonth.name}
          onOpenRules={() => setIsRulesOpen(true)}
          onBack={() => setCurrentScreen('MONTHS')}
        />
      )}

      {/* 5. Chọn Hoạt Động */}
      {currentScreen === 'ACTIVITIES' && selectedMonth && (
        <ActivitySelectionScreen
          month={selectedMonth}
          onOpenRules={() => setIsRulesOpen(true)}
          onBack={() => setCurrentScreen('MONTHS')}
          onSelectActivity={(act) => {
            setSelectedActivity(act);
            setCurrentScreen('UPLOAD');
          }}
        />
      )}

      {/* 6. Upload / Chụp Hóa Đơn */}
      {currentScreen === 'UPLOAD' && selectedActivity && (
        <BillUploadScreen
          activity={selectedActivity}
          onOpenRules={() => setIsRulesOpen(true)}
          onBack={() => setCurrentScreen('ACTIVITIES')}
          onSuccess={(billId) => {
            setCurrentBillId(billId);
            setCurrentScreen('WAITING');
          }}
        />
      )}

      {/* 7. Chờ Duyệt (Polling) */}
      {currentScreen === 'WAITING' && currentBillId && (
        <WaitingScreen
          billId={currentBillId}
          onOpenRules={() => setIsRulesOpen(true)}
          onApproved={(billData) => {
            setReviewedBillData(billData);
            setCurrentScreen('APPROVED');
          }}
          onRejected={(billData) => {
            setReviewedBillData(billData);
            setCurrentScreen('REJECTED');
          }}
        />
      )}

      {/* 8. Duyệt Thành Công (Approved) */}
      {currentScreen === 'APPROVED' && (
        <ResultApprovedScreen
          billData={reviewedBillData}
          onOpenRules={() => setIsRulesOpen(true)}
          onContinueAnother={() => {
            setSelectedActivity(null);
            setCurrentScreen('ACTIVITIES');
          }}
        />
      )}

      {/* 9. Từ Chối Hóa Đơn (Rejected) */}
      {currentScreen === 'REJECTED' && (
        <ResultRejectedScreen
          billData={reviewedBillData}
          onOpenRules={() => setIsRulesOpen(true)}
          onRetry={() => {
            setCurrentScreen('UPLOAD');
          }}
        />
      )}

      {/* Global Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </main>
  );
};
