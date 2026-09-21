import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getMultiLangText, normalizeLanguage } from '@/lib/i18n';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, closeLogoutModal, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);

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
          {getMultiLangText(language, { vi: 'Xác nhận đăng xuất', en: 'Confirm sign out', ja: 'ログアウトの確認', ko: '로그아웃 확인', zh: '确认退出登录', fr: 'Confirmer la déconnexion', de: 'Abmelden bestätigen', es: 'Confirmar cierre de sesión' })}
        </h3>

        <p className="text-xs text-[#64748B] leading-relaxed mb-6">
          {getMultiLangText(language, { vi: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Planora không? Mọi lịch trình và thay đổi của bạn đã được tự động lưu.', en: 'Are you sure you want to sign out of Planora? Your schedules and changes have been saved automatically.', ja: 'Planora からログアウトしますか？スケジュールと変更は自動保存されています。', ko: 'Planora에서 로그아웃하시겠습니까? 일정과 변경 사항은 자동 저장되었습니다.', zh: '确定要退出 Planora 吗？你的日程和更改已自动保存。', fr: 'Voulez-vous vraiment vous déconnecter de Planora ? Vos plannings et modifications ont été enregistrés automatiquement.', de: 'Möchten Sie sich wirklich von Planora abmelden? Ihre Zeitpläne und Änderungen wurden automatisch gespeichert.', es: '¿Quieres cerrar sesión en Planora? Tus horarios y cambios se han guardado automáticamente.' })}
        </p>

        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={closeLogoutModal}
            disabled={isLoggingOut}
          >
            {getMultiLangText(language, { vi: 'Hủy bỏ', en: 'Cancel', ja: 'キャンセル', ko: '취소', zh: '取消', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar' })}
          </Button>

          <Button
            variant="destructive"
            fullWidth
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {isLoggingOut ? getMultiLangText(language, { vi: 'Đang xử lý...', en: 'Processing...', ja: '処理中...', ko: '처리 중...', zh: '处理中...', fr: 'Traitement...', de: 'Wird verarbeitet...', es: 'Procesando...' }) : getMultiLangText(language, { vi: 'Đăng xuất', en: 'Sign out', ja: 'ログアウト', ko: '로그아웃', zh: '退出登录', fr: 'Déconnexion', de: 'Abmelden', es: 'Cerrar sesión' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
