import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  User as UserIcon,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { ApiTimetableItem, ApiEvent } from '@/types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText } from '@/lib/i18n';

export interface TodayTimelineProps {
  timetableToday?: ApiTimetableItem[];
  eventsToday?: ApiEvent[];
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({ timetableToday = [], eventsToday = [] }) => {
  const language = useCurrentLanguage();
  const hasItems = timetableToday.length > 0 || eventsToday.length > 0;
  const totalCount = timetableToday.length + eventsToday.length;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {translate(language, 'dashboard.todaySchedule')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {getMultiLangText(language, {
                vi: 'Theo dõi lịch học & sự kiện diễn ra trong ngày',
                en: 'Track classes & events taking place today',
                ja: '本日の授業とイベントを確認',
                ko: '오늘의 수업 및 이벤트 추적',
                zh: '查看今天的课程与活动日程',
                fr: 'Suivez les cours et événements d\'aujourd\'hui',
                de: 'Verfolgen Sie die heutigen Kurse und Termine',
                es: 'Sigue las clases y eventos de hoy',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
            {totalCount} {translate(language, 'dashboard.itemsEvents')}
          </span>
          <Link
            to="/timetable"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-2"
          >
            <span>{getMultiLangText(language, { vi: 'TKB', en: 'Timetable', ja: '時間割', ko: '시간표', zh: '课表', fr: 'Planning', de: 'Stundenplan', es: 'Horario' })}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {!hasItems ? (
        /* Enhanced Empty State Card */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-violet-50/60 border border-indigo-100/80 p-8 text-center flex flex-col items-center justify-center gap-4 my-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Calendar className="w-7 h-7" />
          </div>

          <div className="max-w-md flex flex-col gap-1">
            <h3 className="text-base font-bold text-slate-800 font-heading">
              {translate(language, 'dashboard.noScheduleToday')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {getMultiLangText(language, {
                vi: 'Bạn có thể dành thời gian này để hoàn thành các công việc tồn đọng, hoặc sử dụng AI để gợi ý lịch học cá nhân.',
                en: 'You can use this time to complete pending tasks, or use AI to generate your study schedule.',
                ja: '残っているタスクを完了するか、AIで学習スケジュールを作成しましょう。',
                ko: '밀린 작업을 완료하거나 AI를 사용하여 학습 일정을 생성하세요.',
                zh: '您可以利用这段时间完成积压的任务，或使用AI生成学习计划。',
                fr: 'Profitez de ce temps pour terminer vos tâches ou laissez l\'IA générer votre planning.',
                de: 'Nutzen Sie die Zeit für ausstehende Aufgaben oder lassen Sie sich vom KI-Planer helfen.',
                es: 'Aprovecha este tiempo para terminar tareas pendientes o usa IA para generar tu plan de estudio.',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/timetable"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{translate(language, 'sidebar.timetable')}</span>
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{translate(language, 'sidebar.calendar')}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Timeline List */
        <div className="relative flex flex-col gap-5 pl-2">
          {/* Continuous Vertical Line */}
          <div className="absolute left-[19px] top-3 bottom-6 w-0.5 bg-slate-200 pointer-events-none" />

          {/* Timetable Items */}
          {timetableToday.map((item) => (
            <div key={`tt_${item.id}`} className="relative flex items-start gap-4 group z-10">
              <div
                className="w-4 h-4 rounded-full shrink-0 mt-2.5 ring-4 ring-white shadow-xs"
                style={{ backgroundColor: item.color || '#4F46E5' }}
              />

              <div
                className="flex-1 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: item.color || '#4F46E5' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wide" style={{ color: item.color || '#4F46E5' }}>
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <Badge size="sm" customBg="#D8E2FF" customColor="#001A42">
                      {translate(language, 'dashboard.classPeriod')}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900">
                  {item.subjectName || (item as any).courseName}
                  {item.courseCode ? ` (${item.courseCode})` : ''}
                </h3>

                {(item.room || item.lecturer) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    {item.room && (
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {translate(language, 'dashboard.room')} {item.room}
                      </span>
                    )}
                    {item.lecturer && (
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                        {translate(language, 'dashboard.lecturer')}: {item.lecturer}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Events Today */}
          {eventsToday.map((event) => (
            <div key={`evt_${event.id}`} className="relative flex items-start gap-4 group z-10">
              <div
                className="w-4 h-4 rounded-full shrink-0 mt-2.5 ring-4 ring-white shadow-xs"
                style={{ backgroundColor: event.color || '#3525CD' }}
              />

              <div
                className="flex-1 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: event.color || '#3525CD' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wide" style={{ color: event.color || '#3525CD' }}>
                      {event.allDay ? translate(language, 'dashboard.allDay') : `${new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <Badge size="sm" customBg="#E2DFFF" customColor="#3525CD">
                      {translate(language, 'dashboard.event')}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                )}

                {event.location && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

