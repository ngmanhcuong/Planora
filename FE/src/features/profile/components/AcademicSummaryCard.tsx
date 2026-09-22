import { Award, BookOpenCheck, Flame, RefreshCcw, TrendingUp } from 'lucide-react';
import type { UserProfileData } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getProfileCopy } from '../i18n/profileCopy';

export interface AcademicSummaryCardProps {
  profile: UserProfileData;
  gradeScale: '4' | '10';
  onToggleGradeScale: () => void;
}

export const AcademicSummaryCard: React.FC<AcademicSummaryCardProps> = ({ profile, gradeScale, onToggleGradeScale }) => {
  const language = useCurrentLanguage();
  const copy = getProfileCopy(language);
  const creditPercent = Math.round((profile.completedCredits / profile.totalCredits) * 100);
  const equivalentTenPointGpa = Number.isFinite(profile.gpa) ? ((profile.gpa / 4) * 10).toFixed(1) : '0.0';
  const displayGpa = gradeScale === '10' ? equivalentTenPointGpa : profile.gpa.toString();
  const displayGpaSuffix = gradeScale === '10' ? '/ 10' : '/ 4.0';
  const displayGpaHelper = gradeScale === '10'
    ? `${copy.equivalent} ${profile.gpa} / 4.0`
    : `${copy.equivalent} ${equivalentTenPointGpa} ${copy.scale10}`;

  const summaryItems = [
    {
      label: copy.averageGrade,
      value: displayGpa,
      suffix: displayGpaSuffix,
      helper: displayGpaHelper,
      icon: Award,
      accent: 'text-[#4F46E5]',
      bg: 'bg-[#EEF2FF]',
      border: 'border-[#C7D2FE]',
    },
    {
      label: copy.completedCredits,
      value: profile.completedCredits,
      suffix: `/ ${profile.totalCredits} TC`,
      helper: `${creditPercent}% ${copy.program}`,
      icon: BookOpenCheck,
      accent: 'text-[#0F766E]',
      bg: 'bg-[#F0FDFA]',
      border: 'border-[#99F6E4]',
    },
    {
      label: copy.habitStreak,
      value: '14',
      suffix: copy.days,
      helper: copy.habitHelper,
      icon: Flame,
      accent: 'text-[#D97706]',
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
    },
  ];

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#131B2E]">{copy.academicSummaryTitle}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{copy.academicSummarySubtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-bold text-[#047857] ring-1 ring-[#A7F3D0]">
          <TrendingUp className="h-3.5 w-3.5" />
          {copy.rankingExcellent}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {summaryItems.map((item) => {
          const isAverageGrade = item.label === copy.averageGrade;

          return (
            <article key={item.label} className={`relative min-h-[144px] rounded-2xl border ${item.border} ${item.bg} p-4 ${isAverageGrade ? 'pb-12' : ''}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B]">{item.label}</span>
                <item.icon className={`h-5 w-5 ${item.accent}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`font-heading text-3xl font-extrabold ${item.accent}`}>{item.value}</span>
                <span className="text-sm font-semibold text-[#64748B]">{item.suffix}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-[#64748B]">{item.helper}</p>
              {isAverageGrade && (
                <button
                  type="button"
                  onClick={onToggleGradeScale}
                  className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white/90 text-[11px] font-extrabold text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 dark:border-indigo-400/30 dark:bg-white/10 dark:text-indigo-100 dark:hover:bg-white/15"
                  title={gradeScale === '4' ? 'Đổi sang hệ 10' : 'Đổi sang hệ 4'}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                </button>
              )}
              {item.label === copy.completedCredits && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};





