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
import { clsx } from 'clsx';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';

type FilterType = 'all' | 'unread' | 'tasks' | 'events' | 'system';

export const NotificationsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const isVietnamese = language === 'vi';
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
    title: isVietnamese ? 'Thông báo & Nhắc nhở' : 'Notifications & reminders',
    subtitle: isVietnamese
      ? 'Cập nhật tức thì về công việc, lịch trình học tập và nhắc nhở hệ thống.'
      : 'Get instant updates about tasks, study schedules, and system reminders.',
    unread: isVietnamese ? 'chưa đọc' : 'unread',
    markAllRead: isVietnamese ? 'Đánh dấu tất cả đã đọc' : 'Mark all as read',
    markRead: isVietnamese ? 'Đánh dấu đã đọc' : 'Mark as read',
    loadError: isVietnamese ? 'Không tải được thông báo.' : 'Could not load notifications.',
    retry: isVietnamese ? 'Thử lại' : 'Retry',
    readError: isVietnamese ? 'Không thể đánh dấu đã đọc. Vui lòng thử lại.' : 'Could not mark notifications as read. Please try again.',
    emptyTitle: isVietnamese ? 'Không có thông báo nào' : 'No notifications',
    emptyUnread: isVietnamese ? 'Tuyệt vời! Bạn đã đọc hết tất cả thông báo.' : 'Great! You have read all notifications.',
    emptyDefault: isVietnamese ? 'Hiện chưa có thông báo mới nào dành cho bạn.' : 'There are no new notifications for you yet.',
    justNow: isVietnamese ? 'Vừa xong' : 'Just now',
    minutesAgo: (value: number) => isVietnamese ? `${value} phút trước` : `${value} min ago`,
    hoursAgo: (value: number) => isVietnamese ? `${value} giờ trước` : `${value} hr ago`,
    daysAgo: (value: number) => isVietnamese ? `${value} ngày trước` : `${value} days ago`,
    labels: {
      task: isVietnamese ? 'Công việc' : 'Task',
      event: isVietnamese ? 'Sự kiện' : 'Event',
      timetable: isVietnamese ? 'Thời khóa biểu' : 'Timetable',
      habit: isVietnamese ? 'Thói quen' : 'Habit',
      system: isVietnamese ? 'Hệ thống' : 'System',
    },
    filters: {
      all: isVietnamese ? 'Tất cả' : 'All',
      unread: isVietnamese ? `Chưa đọc (${unreadCount})` : `Unread (${unreadCount})`,
      tasks: isVietnamese ? 'Công việc & Deadline' : 'Tasks & deadlines',
      events: isVietnamese ? 'Lịch trình' : 'Schedule',
      system: isVietnamese ? 'Hệ thống' : 'System',
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
      return new Date(dateStr).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US');
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
