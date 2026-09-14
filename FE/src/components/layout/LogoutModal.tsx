import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, closeLogoutModal, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Safely ignore logout network error
    } finally {
      queryClient.clear();
      clearAuth();
      closeLogoutModal();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  return (
    <Modal
      isOpen={isLogoutModalOpen}
      onClose={closeLogoutModal}
      maxWidth="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 rounded-full bg-[#FFF1F2] text-[#F43F5E] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#131B2E] mb-2 font-heading">
          Xác nhận đăng xuất
        </h3>

        <p className="text-xs text-[#64748B] leading-relaxed mb-6">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Planora không? Mọi lịch trình và thay đổi của bạn đã được tự động lưu.
        </p>

        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={closeLogoutModal}
            disabled={isLoggingOut}
          >
            Hủy bỏ
          </Button>

          <Button
            variant="destructive"
            fullWidth
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
