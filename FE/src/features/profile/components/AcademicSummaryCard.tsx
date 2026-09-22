import { Award, BookOpenCheck, Flame, TrendingUp } from 'lucide-react';
import type { UserProfileData } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getMultiLangText } from '@/lib/i18n';

export interface AcademicSummaryCardProps {
  profile: UserProfileData;
}

export const AcademicSummaryCard: React.FC<AcademicSummaryCardProps> = ({ profile }) => {
  const language = useCurrentLanguage();
  const creditPercent = Math.round((profile.completedCredits / profile.totalCredits) * 100);
  const equivalentTenPointGpa = Number.isFinite(profile.gpa) ? ((profile.gpa / 4) * 10).toFixed(1) : '0.0';
  const copy = {
    title: getMultiLangText(language, { vi: 'Tóm tắt học tập', en: 'Academic summary', es: 'Resumen académico' }),
    subtitle: getMultiLangText(language, { vi: 'Theo dõi GPA, tín chỉ và nhịp học hiện tại.', en: 'Track GPA, credits, and your current study rhythm.', es: 'Sigue tu GPA, créditos y ritmo académico actual.' }),
    gpa: getMultiLangText(language, { vi: 'Điểm trung bình', en: 'Average grade', es: 'Promedio' }),
    credits: getMultiLangText(language, { vi: 'Tín chỉ tích lũy', en: 'Completed credits', es: 'Créditos acumulados' }),
    habit: getMultiLangText(language, { vi: 'Chuỗi thói quen', en: 'Habit streak', es: 'Racha de hábitos' }),
    equivalent: getMultiLangText(language, { vi: 'Tương đương', en: 'Equivalent to', es: 'Equivale a' }),
    scale10: getMultiLangText(language, { vi: 'hệ 10', en: 'on 10-point scale', es: 'en escala de 10' }),
    program: getMultiLangText(language, { vi: 'chương trình', en: 'program', es: 'del programa' }),
    days: getMultiLangText(language, { vi: 'ngày', en: 'days', es: 'días' }),
    habitHelper: getMultiLangText(language, { vi: 'Hoàn thành mục tiêu liên tục', en: 'Complete goals consistently', es: 'Objetivos completados de forma continua' }),
    ranking: getMultiLangText(language, { vi: 'Xếp loại: Xuất sắc', en: 'Ranking: Excellent', es: 'Clasificación: Excelente' }),
  };

  const summaryItems = [
    {
      label: copy.gpa,
      value: profile.gpa,
      suffix: '/ 4.0',
      helper: `${copy.equivalent} ${equivalentTenPointGpa} ${copy.scale10}`,
      icon: Award,
      accent: 'text-[#4F46E5]',
      bg: 'bg-[#EEF2FF]',
      border: 'border-[#C7D2FE]',
    },
    {
      label: copy.credits,
      value: profile.completedCredits,
      suffix: `/ ${profile.totalCredits} TC`,
      helper: `${creditPercent}% ${copy.program}`,
      icon: BookOpenCheck,
      accent: 'text-[#0F766E]',
      bg: 'bg-[#F0FDFA]',
      border: 'border-[#99F6E4]',
    },
    {
      label: copy.habit,
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
          <h3 className="font-heading text-lg font-bold text-[#131B2E]">{copy.title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{copy.subtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-bold text-[#047857] ring-1 ring-[#A7F3D0]">
          <TrendingUp className="h-3.5 w-3.5" />
          {copy.ranking}
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
            {item.label === copy.credits && (
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
