import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CalendarDays, CheckSquare, Loader2, Search, X } from 'lucide-react';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { normalizeLanguage, translate } from '@/lib/i18n';
import { tasksApi } from '@/features/tasks/api/tasksApi';
import { calendarApi } from '@/features/calendar/api/calendarApi';
import { timetableApi } from '@/features/timetable/api/timetableApi';
import type { ApiEvent, ApiTask, ApiTimetableItem } from '@/types';

type SearchResult = {
  id: string;
  title: string;
  detail: string;
  destination: '/tasks' | '/calendar' | '/timetable';
  kind: 'task' | 'event' | 'timetable';
};

const getEventDetail = (event: ApiEvent) => event.location || new Date(event.startAt).toLocaleString('vi-VN');
const getTimetableDetail = (item: ApiTimetableItem) => [item.courseCode, item.room, `${item.startTime} – ${item.endTime}`].filter(Boolean).join(' · ');
const getIcon = (kind: SearchResult['kind']) => kind === 'task' ? CheckSquare : kind === 'event' ? CalendarDays : CalendarClock;

export const Header: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const keyword = query.trim();
    if (keyword.length < 2) {
      requestId.current += 1;
      setResults([]);
      setIsSearching(false);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const [taskResult, eventResult, timetableResult] = await Promise.all([
          tasksApi.getTasks({ search: keyword, limit: 5 }),
          calendarApi.listEvents({ search: keyword, limit: 5 }),
          timetableApi.getWeeklyTimetable(),
        ]);

        if (currentRequest !== requestId.current) return;
        const normalizedKeyword = keyword.toLocaleLowerCase('vi-VN');
        const matchesTimetable = timetableResult.items
          .filter((item) => [item.subjectName, item.courseCode, item.room, item.lecturer].some((value) => value?.toLocaleLowerCase('vi-VN').includes(normalizedKeyword)))
          .slice(0, 5);

        setResults([
          ...taskResult.tasks.map((task: ApiTask): SearchResult => ({
            id: `task-${task.id}`,
            title: task.title,
            detail: task.dueDate ? `Công việc · Hạn ${new Date(task.dueDate).toLocaleDateString('vi-VN')}` : 'Công việc',
            destination: '/tasks',
            kind: 'task',
          })),
          ...eventResult.events.map((event: ApiEvent): SearchResult => ({
            id: `event-${event.id}`,
            title: event.title,
            detail: `Lịch riêng · ${getEventDetail(event)}`,
            destination: '/calendar',
            kind: 'event',
          })),
          ...matchesTimetable.map((item): SearchResult => ({
            id: `timetable-${item.id}`,
            title: item.subjectName,
            detail: `Thời khóa biểu · ${getTimetableDetail(item)}`,
            destination: '/timetable',
            kind: 'timetable',
          })),
        ]);
      } catch {
        if (currentRequest === requestId.current) setResults([]);
      } finally {
        if (currentRequest === requestId.current) setIsSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const openResult = (result: SearchResult) => {
    navigate(result.destination, { state: { globalSearch: query.trim(), resultId: result.id } });
    setIsOpen(false);
  };

  return (
    <header className={clsx('fixed top-0 right-0 z-40 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 px-6 backdrop-blur-md transition-all duration-300 ease-in-out', isSidebarCollapsed ? 'left-20' : 'left-64')}>
      <div aria-hidden="true" />

      <div ref={searchRef} className="relative w-[min(28rem,46vw)] max-w-md justify-self-center">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => { if (event.key === 'Escape') setIsOpen(false); if (event.key === 'Enter' && results[0]) openResult(results[0]); }}
          placeholder={translate(language, 'header.search')}
          aria-label="Tìm kiếm công việc, lịch và thời khóa biểu"
          aria-expanded={isOpen && query.trim().length >= 2}
          aria-controls="global-search-results"
          className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-0 pl-9 pr-9 text-xs text-[#131B2E] placeholder-[#94A3B8] transition-all focus:border-[#4F46E5] focus:bg-white focus:outline-none"
        />
        {query && <button type="button" onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#94A3B8] hover:bg-[#EEF2FF] hover:text-[#4F46E5]" aria-label="Xóa tìm kiếm"><X className="h-3.5 w-3.5" /></button>}

        {isOpen && query.trim().length >= 2 && (
          <div id="global-search-results" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]"><span>Kết quả tìm kiếm</span>{isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />}</div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {!isSearching && results.length === 0 ? <p className="px-3 py-5 text-center text-xs text-[var(--color-text-secondary)]">Không tìm thấy kết quả phù hợp.</p> : results.map((result) => {
                const Icon = getIcon(result.kind);
                return <button key={result.id} type="button" onClick={() => openResult(result)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-[#EEF2FF]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block truncate text-xs font-semibold text-[var(--color-text-primary)]">{result.title}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--color-text-secondary)]">{result.detail}</span></span>
                </button>;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-self-end gap-4"><NotificationMenu /><div className="h-6 w-px bg-[#E2E8F0]" /><UserMenu /></div>
    </header>
  );
};
