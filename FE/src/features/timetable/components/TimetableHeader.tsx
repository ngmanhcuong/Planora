import React from 'react';
import { PlusCircle, Printer, Download, BookOpen, Award, Calendar } from 'lucide-react';
import type { TermSemesterInfo } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface TimetableHeaderProps {
  semesterInfo: TermSemesterInfo;
  onOpenAddModal: () => void;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  semesterInfo,
  onOpenAddModal,
}) => {
  const language = useCurrentLanguage();

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 px-7 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%)]" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-12 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/12 shadow-2xl shadow-black/10 backdrop-blur-md">
            <Calendar className="h-8 w-8 text-indigo-200" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
                {semesterInfo.termName} ({semesterInfo.academicYear})
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
                <BookOpen className="h-4 w-4 text-indigo-200" />
                {semesterInfo.totalSubjects} {translate(language, 'timetable.subjects')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
                <Award className="h-4 w-4 text-emerald-300" />
                {semesterInfo.totalCredits} {translate(language, 'timetable.credits')}
              </span>
            </div>

            <h1 className="mt-3 max-w-5xl text-2xl font-bold leading-tight tracking-[-0.02em] text-white md:text-3xl">
              {translate(language, 'timetable.title')}
            </h1>
            <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-white/80">
              {translate(language, 'timetable.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 lg:justify-end">
          <button
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white/85 shadow-sm backdrop-blur-md transition hover:bg-white/18"
          >
            <Printer className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'timetable.print')}</span>
          </button>

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white/85 shadow-sm backdrop-blur-md transition hover:bg-white/18"
          >
            <Download className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'timetable.export')}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
