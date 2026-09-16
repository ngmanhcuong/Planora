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

type FilterType = 'all' | 'unread' | 'tasks' | 'events' | 'system';

export const NotificationsPage: React.FC = () => {
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
          label: 'Công việc',
        };
      case 'EVENT':
      case 'EVENT_REMINDER':
      case 'EVENT_CONFLICT':
        return {
          icon: <Calendar className="w-5 h-5 text-indigo-600" />,
          bgColor: 'bg-indigo-50 border-indigo-100',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          label: 'Sự kiện',
        };
      case 'TIMETABLE':
      case 'TIMETABLE_REMINDER':
        return {
          icon: <Clock className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-100',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          label: 'Thời khóa biểu',
        };
      case 'HABIT':
      case 'HABIT_REMINDER':
        return {
          icon: <Zap className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-100',
          badgeColor: 'bg-amber-100 text-amber-700',
          label: 'Thói quen',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-sky-600" />,
          bgColor: 'bg-sky-50 border-sky-100',
          badgeColor: 'bg-sky-100 text-sky-700',
          label: 'Hệ thống',
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      if (isNaN(created)) return 'Vừa xong';
      const now = Date.now();
      const diffInSec = Math.floor((now - created) / 1000);
      if (diffInSec < 60) return 'Vừa xong';
      const diffInMin = Math.floor(diffInSec / 60);
      if (diffInMin < 60) return `${diffInMin} phút trước`;
      const diffInHours = Math.floor(diffInMin / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return `${diffInDays} ngày trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {isError && <p role="alert" className="text-sm text-red-600">Không tải được thông báo. <button onClick={() => void refetch()}>Thử lại</button></p>}
      {(markRead.isError || markAllRead.isError) && <p role="alert" className="text-sm text-red-600">Không thể đánh dấu đã đọc. Vui lòng thử lại.</p>}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo & Nhắc nhở</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-sm animate-pulse">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Cập nhật tức thì về công việc, lịch trình học tập và nhắc nhở hệ thống.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'unread', label: `Chưa đọc (${unreadCount})` },
              { id: 'tasks', label: 'Công việc & Deadline' },
              { id: 'events', label: 'Lịch trình' },
              { id: 'system', label: 'Hệ thống' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
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
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Không có thông báo nào</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            {filter === 'unread'
              ? 'Tuyệt vời! Bạn đã đọc hết tất cả thông báo.'
              : 'Hiện chưa có thông báo mới nào dành cho bạn.'}
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
                  'group relative flex items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md',
                  notification.isRead
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-indigo-50/40 border-indigo-100/80 hover:border-indigo-200'
                )}
              >
                {/* Status Dot */}
                {!notification.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                )}

                {/* Icon Box */}
                <div
                  className={clsx(
                    'w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm mt-0.5',
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
                        <span>Đánh dấu đã đọc</span>
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
