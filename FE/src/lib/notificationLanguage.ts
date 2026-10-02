import type { ApiNotification } from '@/types';
import { normalizeLanguage, translateEnglishPhrase } from './i18n';

const languages = ['en', 'fr', 'de', 'es', 'ja', 'ko', 'zh'];
const words: Record<string, string[]> = {
  'công việc': ['Task', 'Tâche', 'Aufgabe', 'Tarea', 'タスク', '작업', '任务'],
  'trạng thái công việc': ['Task status', 'Statut de la tâche', 'Aufgabenstatus', 'Estado de la tarea', 'タスクの状態', '작업 상태', '任务状态'],
  'sự kiện': ['Event', 'Événement', 'Termin', 'Evento', 'イベント', '이벤트', '事件'],
  'thời khóa biểu': ['Timetable', 'Emploi du temps', 'Stundenplan', 'Horario', '時間割', '시간표', '课程表'],
  'tiết học': ['Class', 'Séance', 'Unterricht', 'Clase', '授業', '수업', '课程'],
  'thói quen': ['Habit', 'Habitude', 'Gewohnheit', 'Hábito', '習慣', '습관', '习惯'],
  'hồ sơ': ['Profile', 'Profil', 'Profil', 'Perfil', 'プロフィール', '프로필', '个人资料'],
  'cài đặt': ['Settings', 'Paramètres', 'Einstellungen', 'Configuración', '設定', '설정', '设置'],
  'mật khẩu': ['Password', 'Mot de passe', 'Passwort', 'Contraseña', 'パスワード', '비밀번호', '密码'],
  'mục tiêu': ['Goal', 'Objectif', 'Ziel', 'Objetivo', '目標', '목표', '目标'],
  'ghi chú': ['Note', 'Note', 'Notiz', 'Nota', 'メモ', '메모', '笔记'],
  'danh mục mục tiêu': ['Goal category', 'Catégorie d’objectif', 'Zielkategorie', 'Categoría de objetivo', '目標カテゴリー', '목표 카테고리', '目标类别'],
};
const actions: Record<string, string[]> = {
  create: ['Created', 'Création effectuée', 'Erstellt', 'Creado', '作成しました', '생성됨', '已创建'],
  update: ['Updated', 'Mise à jour effectuée', 'Aktualisiert', 'Actualizado', '更新しました', '업데이트됨', '已更新'],
  delete: ['Deleted', 'Suppression effectuée', 'Gelöscht', 'Eliminado', '削除しました', '삭제됨', '已删除'],
  status: ['Status changed', 'Statut modifié', 'Status geändert', 'Estado cambiado', '状態を変更しました', '상태 변경됨', '状态已更改'],
  pin: ['Pin changed', 'Épinglage modifié', 'Anheftung geändert', 'Fijación cambiada', 'ピン留めを変更しました', '고정 변경됨', '置顶已更改'],
};
const fixed: Record<string, string[]> = {
  'Đánh dấu hoàn thành thành công': ['Marked complete', 'Marqué comme terminé', 'Als erledigt markiert', 'Marcado como completado', '完了にしました', '완료로 표시됨', '已标记完成'],
  'Bỏ đánh dấu hoàn thành thành công': ['Completion undone', 'Achèvement annulé', 'Erledigung rückgängig gemacht', 'Finalización deshecha', '完了を取り消しました', '완료 취소됨', '已取消完成'],
  'Nhắc nhở công việc sắp tới hạn': ['Task due soon', 'Échéance de tâche proche', 'Aufgabe bald fällig', 'Tarea próxima a vencer', 'タスクの期限が近づいています', '작업 마감 임박', '任务即将到期'],
  'Công việc quá hạn': ['Overdue task', 'Tâche en retard', 'Überfällige Aufgabe', 'Tarea vencida', '期限切れのタスク', '기한이 지난 작업', '任务已逾期'],
  'Nhắc nhở sự kiện sắp diễn ra': ['Upcoming event', 'Événement à venir', 'Bevorstehender Termin', 'Próximo evento', '今後のイベント', '예정된 이벤트', '即将开始的事件'],
  'Cảnh báo xung đột sự kiện': ['Event conflict', 'Conflit d’événements', 'Terminkonflikt', 'Conflicto de eventos', 'イベントの重複', '이벤트 시간 충돌', '事件时间冲突'],
};

const ui: Record<string, string[]> = {
  'Chi tiết thông báo': ['Notification details', 'Détails de la notification', 'Benachrichtigungsdetails', 'Detalles de la notificación', '通知の詳細', '알림 상세', '通知详情'],
  'Đóng': ['Close', 'Fermer', 'Schließen', 'Cerrar', '閉じる', '닫기', '关闭'],
  'Thông báo': ['Notifications', 'Notifications', 'Benachrichtigungen', 'Notificaciones', '通知', '알림', '通知'],
  'chưa đọc': ['unread', 'non lus', 'ungelesen', 'sin leer', '未読', '읽지 않음', '未读'],
  'Làm mới': ['Refresh', 'Actualiser', 'Aktualisieren', 'Actualizar', '更新', '새로 고침', '刷新'],
  'Đọc tất cả': ['Mark all read', 'Tout marquer comme lu', 'Alle als gelesen markieren', 'Marcar todo como leído', 'すべて既読にする', '모두 읽음', '全部已读'],
  'Xem tất cả thông báo': ['View all notifications', 'Voir toutes les notifications', 'Alle Benachrichtigungen', 'Ver todas las notificaciones', 'すべての通知を見る', '모든 알림 보기', '查看所有通知'],
  'Đang tải thông báo...': ['Loading notifications…', 'Chargement des notifications…', 'Benachrichtigungen werden geladen…', 'Cargando notificaciones…', '通知を読み込み中…', '알림 로딩 중…', '正在加载通知…'],
  'Chưa có thông báo.': ['No notifications yet.', 'Aucune notification.', 'Noch keine Benachrichtigungen.', 'No hay notificaciones.', '通知はありません。', '알림이 없습니다.', '暂无通知。'],
  'Không tải được thông báo. Bấm Làm mới để thử lại.': ['Could not load notifications. Refresh to retry.', 'Chargement impossible. Actualisez pour réessayer.', 'Laden fehlgeschlagen. Bitte aktualisieren.', 'No se pudieron cargar. Actualiza para reintentar.', '読み込めません。更新してください。', '불러오지 못했습니다. 새로 고침하세요.', '加载失败，请刷新重试。'],
  'Không cập nhật được trạng thái. Vui lòng thử lại.': ['Could not update status. Please retry.', 'Mise à jour impossible. Réessayez.', 'Status konnte nicht aktualisiert werden.', 'No se pudo actualizar el estado.', '状態を更新できません。再試行してください。', '상태 업데이트 실패. 다시 시도하세요.', '状态更新失败，请重试。'],
};
export function notificationText(language: string, text: string): string {
  const normalized = normalizeLanguage(language);
  if (normalized === 'vi') return text;
  const index = languages.indexOf(normalized);
  const values = ui[text];
  if (!values) return text;
  return index < 0 ? translateEnglishPhrase(normalized, values[0]) : values[index] || text;
}

// Translate only recognized system templates, never user-entered names or text.
export function localizeNotification(item: ApiNotification, language: string): ApiNotification {
  const normalized = normalizeLanguage(language);
  if (normalized === 'vi') return item;
  const index = languages.indexOf(normalized);
  const pick = (values?: string[]) => values
    ? (index < 0 ? translateEnglishPhrase(normalized, values[0]) : values[index])
    : undefined;
  let title = pick(fixed[item.title]);
  const match = item.title.match(/^(Tạo|Cập nhật|Xóa|Đổi|Thay đổi) (.+) thành công$/)
    || item.title.match(/^(Đã thêm|Đã cập nhật|Đã xóa|Đã đổi trạng thái|Đã đổi ghim) (.+)$/);
  if (match && words[match[2]]) {
    const action = /Tạo|Đã thêm/.test(match[1]) ? 'create' : /Xóa|Đã xóa/.test(match[1]) ? 'delete' : match[1] === 'Đã đổi trạng thái' ? 'status' : match[1] === 'Đã đổi ghim' ? 'pin' : 'update';
    title = `${pick(words[match[2]])} — ${pick(actions[action])}`;
  }
  if (!title) return item;
  let message = item.message;
  if (message === item.title) message = title;
  else if (message.startsWith(`${item.title}:`)) message = message.slice(item.title.length + 1).trim();
  else if (fixed[item.title]) {
    const name = message.match(/^(?:Công việc|Sự kiện) "([\s\S]*)" (?:sắp đến hạn|đã quá hạn|sắp diễn ra|bị trùng lịch)$/)?.[1];
    if (name !== undefined) message = `${title}: “${name}”`;
  }
  return { ...item, title, message };
}
