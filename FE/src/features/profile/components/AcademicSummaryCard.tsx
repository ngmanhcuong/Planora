import { Award, Flame } from 'lucide-react';
import type { UserProfileData } from '../types';

export interface AcademicSummaryCardProps {
  profile: UserProfileData;
}

export const AcademicSummaryCard: React.FC<AcademicSummaryCardProps> = ({ profile }) => {
  const creditPercent = Math.round((profile.completedCredits / profile.totalCredits) * 100);

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Award className="w-5 h-5 text-[#4F46E5]" />
          Tóm tắt học tập & Tiến độ
        </h3>
        <span className="text-xs font-semibold text-[#006E4B] bg-[#D7E8CD] px-2.5 py-1 rounded-full">
          Xếp loại: Xuất sắc
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* GPA Box */}
        <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex flex-col gap-1">
          <span className="text-xs font-bold text-[#3323CC]">Điểm trung bình (GPA)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#4F46E5] font-heading">{profile.gpa}</span>
            <span className="text-xs text-[#64748B] font-semibold">/ 4.0</span>
          </div>
          <span className="text-[11px] text-[#464555] font-medium mt-1">Hệ 4 (Tương đương 8.6 hệ 10)</span>
        </div>

        {/* Credits Box */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
          <span className="text-xs font-bold text-[#131B2E]">Tín chỉ đã tích lũy</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#131B2E] font-heading">
              {profile.completedCredits}
            </span>
            <span className="text-xs text-[#64748B] font-semibold">/ {profile.totalCredits} TC</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
        </div>

        {/* Streak Box */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col gap-1">
          <span className="text-xs font-bold text-[#B45309] flex items-center gap-1">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            Chuỗi thói quen học
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#D97706] font-heading">14 Ngày</span>
          </div>
          <span className="text-[11px] text-[#B45309] font-medium mt-1">Hoàn thành mục tiêu liên tục!</span>
        </div>
      </div>
    </div>
  );
};
