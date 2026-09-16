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
    <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Semester Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                {translate(language, 'timetable.title')}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                {semesterInfo.termName} ({semesterInfo.academicYear})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600 sm:ml-2">
            <span className="flex items-center gap-1.5 text-slate-900">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              {semesterInfo.totalSubjects} {translate(language, 'timetable.subjects')}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5 text-slate-900">
              <Award className="w-4 h-4 text-emerald-600" />
              {semesterInfo.totalCredits} {translate(language, 'timetable.credits')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">{translate(language, 'timetable.print')}</span>
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">{translate(language, 'timetable.export')}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

