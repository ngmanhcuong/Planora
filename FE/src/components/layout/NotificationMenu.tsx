import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useUnreadCount, useMarkReadNotification, useMarkAllReadNotifications } from './hooks/useNotifications';

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const count = useUnreadCount();
  const list = useNotifications();
  const mark = useMarkReadNotification();
  const markAll = useMarkAllReadNotifications();
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const refresh = async () => { await count.refetch(); await list.refetch(); };
  const unread = count.data || 0;
  return <div ref={ref} className="relative">
    <button ref={trigger} type="button" aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`} aria-expanded={open} aria-controls="notification-menu" onClick={() => { setOpen(!open); if (!open) void refresh(); }} className="relative rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9]">
      <Bell className="h-5 w-5" />
      {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#F43F5E] px-1.5 text-[10px] font-bold text-white">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <section id="notification-menu" aria-label="Thông báo" className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4">
        <h2 className="text-sm font-semibold text-[#131B2E]">Thông báo {unread > 0 && `(${unread})`}</h2>
        <button type="button" aria-label="Đóng thông báo" onClick={() => {setOpen(false); trigger.current?.focus();}}><X size={18} /></button>
      </div>
      <div className="flex justify-between border-b border-[#E2E8F0] px-4 py-2 text-xs text-[#4F46E5]">
        <button onClick={() => void refresh()} disabled={count.isFetching || list.isFetching}>Làm mới</button>
        <button onClick={() => markAll.mutate()} disabled={!unread || markAll.isPending}>Đọc tất cả</button>
      </div>
      {(mark.isError || markAll.isError) && <p role="alert" className="p-3 text-xs text-red-600">Không cập nhật được trạng thái. Vui lòng thử lại.</p>}
      <div className="max-h-[55vh] overflow-y-auto">
        {list.isLoading ? <p role="status" className="p-6 text-sm text-[#64748B]">Đang tải thông báo...</p> : list.isError || count.isError ? <p role="alert" className="p-4 text-sm text-red-600">Không tải được thông báo. Bấm Làm mới để thử lại.</p> : !list.data?.length ? <p className="p-6 text-sm text-[#64748B]">Chưa có thông báo. Nhắc nhở sẽ xuất hiện khi công việc hoặc sự kiện sắp đến hạn.</p> : list.data.slice(0, 8).map(item => <button key={item.id} disabled={mark.isPending} onClick={async () => {
          try { if (!item.isRead) await mark.mutateAsync(item.id); setOpen(false); navigate(['/tasks', '/calendar', '/timetable', '/habits', '/settings'].includes(item.link || '') ? item.link! : '/notifications'); } catch { /* Mutation error is displayed above. */ }
        }} className={`block w-full border-b border-[#E2E8F0] p-4 text-left hover:bg-[#F8FAFC] ${item.isRead ? '' : 'bg-[#EEF2FF]'}`}>
          <p className="text-xs font-semibold text-[#131B2E]">{!item.isRead && <span className="mr-1 text-[#4F46E5]">●</span>}{item.title}</p>
          <p className="mt-1 text-xs text-[#64748B]">{item.message}</p>
          <time className="mt-2 block text-[10px] text-[#64748B]">{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
        </button>)}
      </div>
      <button onClick={() => {setOpen(false); navigate('/notifications');}} className="w-full p-3 text-xs font-semibold text-[#4F46E5] hover:bg-[#F8FAFC]">Xem tất cả thông báo</button>
    </section>}
  </div>;
}
