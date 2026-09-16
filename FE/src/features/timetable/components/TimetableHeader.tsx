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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        {/* Title & Semester Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 flex items-center justify-center border border-white/15 backdrop-blur-md shadow-lg shadow-black/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                {translate(language, 'timetable.title')}
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/10 text-indigo-100 border border-white/15 backdrop-blur-md">
                {semesterInfo.termName} ({semesterInfo.academicYear})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-bold text-indigo-100 backdrop-blur-md sm:ml-2">
            <span className="flex items-center gap-1.5 text-white">
              <BookOpen className="w-4 h-4 text-indigo-200" />
              {semesterInfo.totalSubjects} {translate(language, 'timetable.subjects')}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="flex items-center gap-1.5 text-white">
              <Award className="w-4 h-4 text-emerald-300" />
              {semesterInfo.totalCredits} {translate(language, 'timetable.credits')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">{translate(language, 'timetable.print')}</span>
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
          >
            <Download className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">{translate(language, 'timetable.export')}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
