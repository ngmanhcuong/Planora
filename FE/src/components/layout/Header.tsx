import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CalendarDays, CheckSquare, Loader2, Menu, Search, X } from 'lucide-react';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { Logo } from '@/components/ui/Logo';
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
const getTimetableDetail = (item: ApiTimetableItem) =>
  [item.courseCode, item.room, `${item.startTime} – ${item.endTime}`].filter(Boolean).join(' · ');
const getIcon = (kind: SearchResult['kind']) =>
  kind === 'task' ? CheckSquare : kind === 'event' ? CalendarDays : CalendarClock;

export const Header: React.FC = () => {
  const { isSidebarCollapsed, toggleMobileSidebar } = useUIStore();
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          .filter((item) =>
            [item.subjectName, item.courseCode, item.room, item.lecturer].some((value) =>
              value?.toLocaleLowerCase('vi-VN').includes(normalizedKeyword)
            )
          )
          .slice(0, 5);

        setResults([
          ...taskResult.tasks.map(
            (task: ApiTask): SearchResult => ({
              id: `task-${task.id}`,
              title: task.title,
              detail: task.dueDate
                ? `Công việc · Hạn ${new Date(task.dueDate).toLocaleDateString('vi-VN')}`
                : 'Công việc',
              destination: '/tasks',
              kind: 'task',
            })
          ),
          ...eventResult.events.map(
            (event: ApiEvent): SearchResult => ({
              id: `event-${event.id}`,
              title: event.title,
              detail: `Lịch riêng · ${getEventDetail(event)}`,
              destination: '/calendar',
              kind: 'event',
            })
          ),
          ...matchesTimetable.map(
            (item): SearchResult => ({
              id: `timetable-${item.id}`,
              title: item.subjectName,
              detail: `Thời khóa biểu · ${getTimetableDetail(item)}`,
              destination: '/timetable',
              kind: 'timetable',
            })
          ),
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
    <header
      className={clsx(
        'fixed top-0 right-0 z-40 flex h-16 items-center justify-between gap-3 sm:gap-6 border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900/85',
        'left-0 lg:left-64',
        isSidebarCollapsed && 'lg:left-20'
      )}
    >
      {/* Mobile Brand Logo with Sidebar Hamburger Button */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Mở menu chức năng"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" showText variant="plain" theme="light" />
      </div>

      {/* Global Search Input */}
      <div ref={searchRef} className="relative flex-1 max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
            if (event.key === 'Enter' && results[0]) openResult(results[0]);
          }}
          placeholder={translate(language, 'header.search')}
          aria-label="Tìm kiếm công việc, lịch và thời khóa biểu"
          aria-expanded={isOpen && query.trim().length >= 2}
          aria-controls="global-search-results"
          className="h-9.5 w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 py-0 pl-10 pr-16 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-800"
        />

        {/* Clear query or Shortcut indicator */}
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 cursor-pointer"
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200/90 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        )}

        {/* Search Results Dropdown */}
        {isOpen && query.trim().length >= 2 && (
          <div
            id="global-search-results"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/10 z-50 animate-in fade-in slide-in-from-top-1 duration-150 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Kết quả tìm kiếm</span>
              {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />}
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5 calendar-soft-scrollbar">
              {!isSearching && results.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Không tìm thấy kết quả phù hợp.</p>
              ) : (
                results.map((result) => {
                  const Icon = getIcon(result.kind);
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => openResult(result)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/80 dark:hover:bg-slate-800 cursor-pointer group"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-slate-800 dark:text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          {result.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {result.detail}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right actions: Notifications & UserMenu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationMenu />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
        <UserMenu />
      </div>
    </header>
  );
};
