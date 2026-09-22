import { Award, BookOpenCheck, Flame, TrendingUp } from 'lucide-react';
import type { UserProfileData } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getProfileCopy } from '../i18n/profileCopy';

export interface AcademicSummaryCardProps {
  profile: UserProfileData;
}

export const AcademicSummaryCard: React.FC<AcademicSummaryCardProps> = ({ profile }) => {
  const language = useCurrentLanguage();
  const copy = getProfileCopy(language);
  const creditPercent = Math.round((profile.completedCredits / profile.totalCredits) * 100);
  const equivalentTenPointGpa = Number.isFinite(profile.gpa) ? ((profile.gpa / 4) * 10).toFixed(1) : '0.0';

  const summaryItems = [
    {
      label: copy.averageGrade,
      value: profile.gpa,
      suffix: '/ 4.0',
      helper: `${copy.equivalent} ${equivalentTenPointGpa} ${copy.scale10}`,
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
        {summaryItems.map((item) => (
          <article key={item.label} className={`rounded-2xl border ${item.border} ${item.bg} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B]">{item.label}</span>
              <item.icon className={`h-5 w-5 ${item.accent}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-heading text-3xl font-extrabold ${item.accent}`}>{item.value}</span>
              <span className="text-sm font-semibold text-[#64748B]">{item.suffix}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-[#64748B]">{item.helper}</p>
            {item.label === copy.completedCredits && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
