import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckSquare,
  Calendar,
  Clock,
  Zap,
  Check,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import {
  useNotifications,
  useUnreadCount,
  useMarkReadNotification,
  useMarkAllReadNotifications,
} from '@/components/layout/hooks/useNotifications';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getMultiLangText, translateRelativeTime } from '@/lib/i18n';
import { clsx } from 'clsx';

const LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

type FilterType = 'all' | 'unread' | 'tasks' | 'events' | 'system';

export const NotificationsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: notificationsData, isLoading, isError, refetch } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkReadNotification();
  const markAllRead = useMarkAllReadNotifications();

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    return notificationsData;
  }, [notificationsData]);

  const unreadCount = typeof unreadData === 'number' ? unreadData : 0;
  const copy = {
    title: getMultiLangText(language, {
      vi: 'Thông báo & Nhắc nhở',
      en: 'Notifications & reminders',
      ja: '通知とリマインダー',
      ko: '알림 및 리마인더',
      zh: '通知与提醒',
      fr: 'Notifications & rappels',
      de: 'Benachrichtigungen & Erinnerungen',
      es: 'Notificaciones y recordatorios',
    }),
    subtitle: getMultiLangText(language, {
      vi: 'Cập nhật tức thì về công việc, lịch trình học tập và nhắc nhở hệ thống.',
      en: 'Get instant updates about tasks, study schedules, and system reminders.',
      ja: 'タスク、学習スケジュール、システム通知の最新情報を確認できます。',
      ko: '작업, 학습 일정 및 시스템 알림에 대한 즉각적인 업데이트를 받으세요.',
      zh: '及时获取任务、学习日程及系统提醒的更新。',
      fr: 'Recevez des mises à jour instantanées sur vos tâches et rappels.',
      de: 'Erhalten Sie sofortige Updates zu Aufgaben und Erinnerungen.',
      es: 'Obtén actualizaciones instantáneas sobre tus tareas y avisos.',
    }),
    unread: getMultiLangText(language, {
      vi: 'chưa đọc',
      en: 'unread',
      ja: '未読',
      ko: '읽지 않음',
      zh: '未读',
      fr: 'non lus',
      de: 'ungelesen',
      es: 'no leídos',
    }),
    markAllRead: getMultiLangText(language, {
      vi: 'Đánh dấu tất cả đã đọc',
      en: 'Mark all as read',
      ja: 'すべて既読にする',
      ko: '모두 읽음으로 표시',
      zh: '全部标记为已读',
      fr: 'Tout marquer comme lu',
      de: 'Alle als gelesen markieren',
      es: 'Marcar todo como leído',
    }),
    markRead: getMultiLangText(language, {
      vi: 'Đánh dấu đã đọc',
      en: 'Mark as read',
      ja: '既読にする',
      ko: '읽음으로 표시',
      zh: '标记为已读',
      fr: 'Marquer comme lu',
      de: 'Als gelesen markieren',
      es: 'Marcar como leído',
    }),
    loadError: getMultiLangText(language, {
      vi: 'Không tải được thông báo.',
      en: 'Could not load notifications.',
      ja: '通知を読み込めませんでした。',
      ko: '알림을 불러올 수 없습니다.',
      zh: '无法加载通知。',
      fr: 'Impossible de charger les notifications.',
      de: 'Benachrichtigungen konnten nicht geladen werden.',
      es: 'No se pudieron cargar las notificaciones.',
    }),
    retry: getMultiLangText(language, {
      vi: 'Thử lại',
      en: 'Retry',
      ja: '再試行',
      ko: '다시 시도',
      zh: '重试',
      fr: 'Réessayer',
      de: 'Erneut versuchen',
      es: 'Reintentar',
    }),
    readError: getMultiLangText(language, {
      vi: 'Không thể đánh dấu đã đọc. Vui lòng thử lại.',
      en: 'Could not mark notifications as read. Please try again.',
      ja: '既読にできませんでした。もう一度お試しください。',
      ko: '읽음으로 표시하지 못했습니다. 다시 시도해 주세요.',
      zh: '无法标记为已读，请重试。',
      fr: 'Échec du marquage comme lu.',
      de: 'Fehler beim Als-Gelesen-Markieren.',
      es: 'No se pudo marcar como leído.',
    }),
    emptyTitle: getMultiLangText(language, {
      vi: 'Không có thông báo nào',
      en: 'No notifications',
      ja: '通知はありません',
      ko: '알림이 없습니다',
      zh: '暂无通知',
      fr: 'Aucune notification',
      de: 'Keine Benachrichtigungen',
      es: 'Sin notificaciones',
    }),
    emptyUnread: getMultiLangText(language, {
      vi: 'Tuyệt vời! Bạn đã đọc hết tất cả thông báo.',
      en: 'Great! You have read all notifications.',
      ja: '素晴らしい！すべての通知を確認しました。',
      ko: '좋습니다! 모든 알림을 확인했습니다.',
      zh: '太棒了！您已阅读所有通知。',
      fr: 'Super ! Vous avez lu toutes vos notifications.',
      de: 'Super! Sie haben alle Benachrichtigungen gelesen.',
      es: '¡Genial! Has leído todas las notificaciones.',
    }),
    emptyDefault: getMultiLangText(language, {
      vi: 'Hiện chưa có thông báo mới nào dành cho bạn.',
      en: 'There are no new notifications for you yet.',
      ja: '現在、新しい通知はありません。',
      ko: '현재 새로운 알림이 없습니다.',
      zh: '目前没有新的通知。',
      fr: 'Aucune nouvelle notification pour le moment.',
      de: 'Keine neuen Benachrichtigungen vorliegend.',
      es: 'No tienes notificaciones nuevas por ahora.',
    }),
    justNow: translateRelativeTime(language, 'Just now'),
    minutesAgo: (value: number) => translateRelativeTime(language, `${value} min ago`),
    hoursAgo: (value: number) => translateRelativeTime(language, `${value} hr ago`),
    daysAgo: (value: number) => translateRelativeTime(language, `${value} days ago`),
    labels: {
      task: getMultiLangText(language, { vi: 'Công việc', en: 'Task', ja: 'タスク', ko: '작업', zh: '任务', fr: 'Tâche', de: 'Aufgabe', es: 'Tarea' }),
      event: getMultiLangText(language, { vi: 'Sự kiện', en: 'Event', ja: 'イベント', ko: '이벤트', zh: '事件', fr: 'Événement', de: 'Ereignis', es: 'Evento' }),
      timetable: getMultiLangText(language, { vi: 'Thời khóa biểu', en: 'Timetable', ja: '時間割', ko: '시간표', zh: '课程表', fr: 'Emploi du temps', de: 'Stundenplan', es: 'Horario' }),
      habit: getMultiLangText(language, { vi: 'Thói quen', en: 'Habit', ja: '習慣', ko: '습관', zh: '习惯', fr: 'Habitude', de: 'Gewohnheit', es: 'Hábito' }),
      system: getMultiLangText(language, { vi: 'Hệ thống', en: 'System', ja: 'システム', ko: '시스템', zh: '系统', fr: 'Système', de: 'System', es: 'Sistema' }),
    },
    filters: {
      all: getMultiLangText(language, { vi: 'Tất cả', en: 'All', ja: 'すべて', ko: '전체', zh: '全部', fr: 'Tous', de: 'Alle', es: 'Todos' }),
      unread: `${getMultiLangText(language, { vi: 'Chưa đọc', en: 'Unread', ja: '未読', ko: '읽지 않음', zh: '未读', fr: 'Non lus', de: 'Ungelesen', es: 'No leídos' })} (${unreadCount})`,
      tasks: getMultiLangText(language, { vi: 'Công việc & Deadline', en: 'Tasks & deadlines', ja: 'タスクと締切', ko: '작업 및 마감일', zh: '任务与截止日期', fr: 'Tâches & Échéances', de: 'Aufgaben & Fristen', es: 'Tareas y Fechas límite' }),
      events: getMultiLangText(language, { vi: 'Lịch trình', en: 'Schedule', ja: 'スケジュール', ko: '일정', zh: '日程', fr: 'Planning', de: 'Zeitplan', es: 'Programación' }),
      system: getMultiLangText(language, { vi: 'Hệ thống', en: 'System', ja: 'システム', ko: '시스템', zh: '系统', fr: 'Système', de: 'System', es: 'Sistema' }),
    },
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'tasks') return n.type === 'DEADLINE' || n.type === 'TASK' || n.type === 'TASK_REMINDER';
      if (filter === 'events') return n.type === 'EVENT' || n.type === 'TIMETABLE' || n.type === 'EVENT_REMINDER';
      if (filter === 'system') return n.type === 'SYSTEM';
      return true;
    });
  }, [notifications, filter]);

  const getNotificationConfig = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DEADLINE':
      case 'TASK':
      case 'TASK_REMINDER':
      case 'TASK_OVERDUE':
        return {
          icon: <CheckSquare className="w-5 h-5 text-rose-600" />,
          bgColor: 'bg-rose-50 border-rose-100',
          badgeColor: 'bg-rose-100 text-rose-700',
          label: copy.labels.task,
        };
      case 'EVENT':
      case 'EVENT_REMINDER':
      case 'EVENT_CONFLICT':
        return {
          icon: <Calendar className="w-5 h-5 text-indigo-600" />,
          bgColor: 'bg-indigo-50 border-indigo-100',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          label: copy.labels.event,
        };
      case 'TIMETABLE':
      case 'TIMETABLE_REMINDER':
        return {
          icon: <Clock className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-100',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          label: copy.labels.timetable,
        };
      case 'HABIT':
      case 'HABIT_REMINDER':
        return {
          icon: <Zap className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-100',
          badgeColor: 'bg-amber-100 text-amber-700',
          label: copy.labels.habit,
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-sky-600" />,
          bgColor: 'bg-sky-50 border-sky-100',
          badgeColor: 'bg-sky-100 text-sky-700',
          label: copy.labels.system,
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      if (isNaN(created)) return copy.justNow;
      const now = Date.now();
      const diffInSec = Math.floor((now - created) / 1000);
      if (diffInSec < 60) return copy.justNow;
      const diffInMin = Math.floor(diffInSec / 60);
      if (diffInMin < 60) return copy.minutesAgo(diffInMin);
      const diffInHours = Math.floor(diffInMin / 60);
      if (diffInHours < 24) return copy.hoursAgo(diffInHours);
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return copy.daysAgo(diffInDays);
      return new Date(dateStr).toLocaleDateString(LOCALE_MAP[language || 'vi'] || 'en-US');
    } catch {
      return copy.justNow;
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {isError && <p role="alert" className="text-sm text-red-600">{copy.loadError} <button onClick={() => void refetch()}>{copy.retry}</button></p>}
      {(markRead.isError || markAllRead.isError) && <p role="alert" className="text-sm text-red-600">{copy.readError}</p>}
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200 shadow-lg shadow-black/10 backdrop-blur-md">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">{copy.title}</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-sm animate-pulse">
                  {unreadCount} {copy.unread}
                </span>
              )}
            </div>
            <p className="text-sm text-indigo-100/90 mt-1">
              {copy.subtitle}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-indigo-100 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-black/10 border border-white/15 backdrop-blur-md active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{copy.markAllRead}</span>
          </button>
        )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto py-1">
          {(
            [
              { id: 'all', label: copy.filters.all },
              { id: 'unread', label: copy.filters.unread },
              { id: 'tasks', label: copy.filters.tasks },
              { id: 'events', label: copy.filters.events },
              { id: 'system', label: copy.filters.system },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap',
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm flex min-h-[280px] flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">{copy.emptyTitle}</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            {filter === 'unread'
              ? copy.emptyUnread
              : copy.emptyDefault}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const config = getNotificationConfig(notification.type);
            return (
              <div
                key={notification.id}
                className={clsx(
                  'group relative flex items-start gap-4 p-4 md:p-5 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5',
                  notification.isRead
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-indigo-50/60 border-indigo-100/80 hover:border-indigo-200'
                )}
              >
                {/* Status Dot */}
                {!notification.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                )}

                {/* Icon Box */}
                <div
                  className={clsx(
                    'w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm mt-0.5 ring-1 ring-black/5',
                    config.bgColor
                  )}
                >
                  {config.icon}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={clsx('px-2 py-0.5 rounded-md text-[11px] font-semibold', config.badgeColor)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <h4
                    className={clsx(
                      'text-sm font-semibold leading-tight',
                      notification.isRead ? 'text-slate-800' : 'text-slate-900 font-bold'
                    )}
                  >
                    {notification.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>

                  {/* Actions */}
                  {!notification.isRead && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => markRead.mutate(notification.id)}
                        disabled={markRead.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-100/70 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{copy.markRead}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
