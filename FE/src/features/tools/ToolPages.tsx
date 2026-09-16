import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Flag,
  Lightbulb,
  Plus,
  Send,
  Target,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  Flame,
  Check,
  Search,
  BookOpen,
  Briefcase,
  User,
  HeartPulse,
  Trophy,
  Zap,
  X,
  Tag,
  FolderPlus,
} from 'lucide-react';
import { AiAssistantPanel } from '@/features/ai';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { clsx } from 'clsx';

const cardClass = 'rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200';

interface GoalItem {
  id: number;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
  description?: string;
  isCompleted?: boolean;
}

export interface CategoryOption {
  id: string;
  label: string;
  color: string;
  bg: string;
  icon?: any;
}

const COLOR_THEMES = [
  { id: 'indigo', label: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', dot: 'bg-indigo-500' },
  { id: 'emerald', label: 'Xanh lá', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'rose', label: 'Hồng / Đỏ', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', dot: 'bg-rose-500' },
  { id: 'amber', label: 'Vàng cam', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', dot: 'bg-amber-500' },
  { id: 'purple', label: 'Tím', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', dot: 'bg-purple-500' },
  { id: 'sky', label: 'Xanh dương', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100', dot: 'bg-sky-500' },
];

export const AssistantPage: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const language = useCurrentLanguage();
  const promptCards = [
    translate(language, 'assistant.prompt.today'),
    translate(language, 'assistant.prompt.week'),
    translate(language, 'assistant.prompt.breakdown'),
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-200 backdrop-blur-md border border-white/15">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {translate(language, 'assistant.badge')}
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {translate(language, 'assistant.title')}
            </h1>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed">
              {translate(language, 'assistant.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4 fill-slate-950" />
            {translate(language, 'assistant.open')}
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {promptCards.map((text) => (
          <button
            key={text}
            onClick={() => setIsAssistantOpen(true)}
            className={`${cardClass} flex items-start gap-4 p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md cursor-pointer group`}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
              {text}
            </span>
          </button>
        ))}
      </div>

      <AiAssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export const GoalsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryOption[]>([
    { id: 'study', label: 'Học tập', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: BookOpen },
    { id: 'work', label: 'Công việc', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: Briefcase },
    { id: 'personal', label: 'Cá nhân', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: User },
    { id: 'health', label: 'Sức khỏe', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: HeartPulse },
  ]);

  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [customCategoryColorTheme, setCustomCategoryColorTheme] = useState<string>('indigo');

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<string>('study');
  const [newTargetDate, setNewTargetDate] = useState('2026-10-15');

  const initialGoals: GoalItem[] = useMemo(() => [
    {
      id: 1,
      title: 'Hoàn thành 4 công việc quan trọng trong tuần',
      category: 'work',
      progress: 75,
      targetDate: '2026-09-20',
      description: 'Tập trung các task ưu tiên cao nhất.',
    },
    {
      id: 2,
      title: 'Duy trì học tập 2 giờ mỗi ngày',
      category: 'study',
      progress: 50,
      targetDate: '2026-09-30',
      description: 'Dành 120 phút mỗi buổi tối để tự học & đọc sách.',
    },
    {
      id: 3,
      title: 'Không để task quá hạn trong tháng 9',
      category: 'personal',
      progress: 90,
      targetDate: '2026-09-30',
      description: 'Hoàn thành 100% deadline trước 23:59.',
    },
    {
      id: 4,
      title: 'Chạy bộ 5km & Tập thể thao 3 buổi/tuần',
      category: 'health',
      progress: 100,
      targetDate: '2026-09-18',
      description: 'Rèn luyện sức khỏe & độ dẻo dai.',
      isCompleted: true,
    },
  ], []);

  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);

  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCategoryName.trim()) return;
    const theme = COLOR_THEMES.find((t) => t.id === customCategoryColorTheme) || COLOR_THEMES[0];
    const newCatId = `custom_${Date.now()}`;
    const newCat: CategoryOption = {
      id: newCatId,
      label: customCategoryName.trim(),
      color: theme.color,
      bg: theme.bg,
      icon: Tag,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategory(newCatId);
    setCustomCategoryName('');
    setIsCreatingCategory(false);
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [goals, selectedCategory, searchQuery]);

  const averageProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
  const completedCount = goals.filter((g) => g.progress === 100 || g.isCompleted).length;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const createdGoal: GoalItem = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      progress: 0,
      targetDate: newTargetDate,
      description: newDescription.trim() || undefined,
    };
    setGoals((prev) => [createdGoal, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsAddingGoal(false);
  };

  const updateProgress = (id: number, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newProg = Math.max(0, Math.min(100, g.progress + delta));
        return {
          ...g,
          progress: newProg,
          isCompleted: newProg === 100,
        };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/15 border border-indigo-800/40">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Planora Goals KPI
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {translate(language, 'goals.title')}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-xl font-medium">
                {translate(language, 'goals.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl shrink-0">
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">
                {translate(language, 'goals.averageProgress')}
              </span>
              <span className="text-2xl font-black text-amber-300 font-heading">{averageProgress}%</span>
            </div>
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">Đã hoàn thành</span>
              <span className="text-2xl font-black text-emerald-400 font-heading">
                {completedCount}/{goals.length}
              </span>
            </div>
            <div className="px-4 py-2 text-center">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">Chuỗi duy trì</span>
              <span className="text-2xl font-black text-rose-400 font-heading flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-rose-400 inline" /> 7 ngày
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mục tiêu..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingGoal ? 'Hủy' : 'Tạo mục tiêu mới'}</span>
          </button>
        </div>
      </div>

      {/* Add Goal Popup Modal */}
      {isAddingGoal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsAddingGoal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Tạo mục tiêu mới
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Thiết lập chỉ số KPI & hạn chót hoàn thành
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Tên mục tiêu *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Đạt 8.0 GPA học kỳ này"
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Mô tả / Ghi chú</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Nhập chi tiết về cách thực hiện mục tiêu..."
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700">Danh mục</label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isCreatingCategory ? 'Hủy' : 'Thêm mục mới'}</span>
                      </button>
                    </div>

                    {!isCreatingCategory ? (
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCreatingCategory(true);
                          } else {
                            setNewCategory(e.target.value);
                          }
                        }}
                        className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 bg-slate-50/50 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                        <option value="__add_new__">➕ Thêm danh mục mới...</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950">
                          <span className="flex items-center gap-1">
                            <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                            Tạo danh mục mới
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCategory(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="Tên danh mục (VD: Tài chính)"
                          className="w-full h-9 px-3 rounded-xl border border-indigo-200 text-xs bg-white focus:outline-none focus:border-indigo-600 font-medium"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {COLOR_THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => setCustomCategoryColorTheme(theme.id)}
                                className={clsx(
                                  'w-5 h-5 rounded-full border transition-all cursor-pointer',
                                  theme.dot,
                                  customCategoryColorTheme === theme.id ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110' : 'border-transparent'
                                )}
                                title={theme.label}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCreateCategory()}
                            disabled={!customCategoryName.trim()}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">Hạn chót mục tiêu</label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo mục tiêu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Goals Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => {
          const catConfig = categories.find((c) => c.id === goal.category) || {
            label: goal.category,
            icon: Tag,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-100',
          };
          const CatIcon = catConfig.icon || Tag;
          const isDone = goal.progress >= 100 || goal.isCompleted;

          return (
            <article
              key={goal.id}
              className={clsx(
                'group relative rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1',
                isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
              )}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold border',
                      catConfig.bg,
                      catConfig.color
                    )}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {catConfig.label}
                  </span>

                  <button
                    onClick={() => setGoals((prev) => prev.filter((item) => item.id !== goal.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>

              {/* Progress & Controls */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {goal.targetDate}
                  </span>
                  <span
                    className={clsx(
                      'font-black font-heading text-sm',
                      isDone ? 'text-emerald-600' : 'text-indigo-600'
                    )}
                  >
                    {goal.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-500'
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateProgress(goal.id, 10)}
                      disabled={isDone}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => updateProgress(goal.id, 25)}
                      disabled={isDone}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +25%
                    </button>
                  </div>

                  <button
                    onClick={() => updateProgress(goal.id, isDone ? -100 : 100)}
                    className={clsx(
                      'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1',
                      isDone
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Đã hoàn thành 🎉' : 'Xong ngay'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Badges / Motivation Section */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-white">Huy hiệu thành tích</h3>
              <p className="text-xs text-indigo-200/70 font-medium">Đạt mốc để mở khóa danh hiệu cá nhân</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Chăm chỉ 7 ngày', desc: 'Duy trì học tập liên tục không gián đoạn.', icon: Flame, color: 'text-amber-400', unlocked: true },
            { title: 'Thủ khoa Deadline', desc: 'Hoàn thành 100% mục tiêu đúng hạn.', icon: Award, color: 'text-indigo-400', unlocked: true },
            { title: 'Siêu Chiến Binh KPI', desc: 'Đạt tiến độ trung bình trên 80%.', icon: Zap, color: 'text-emerald-400', unlocked: averageProgress >= 80 },
          ].map((badge) => (
            <div
              key={badge.title}
              className={clsx(
                'p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3.5 transition-all',
                badge.unlocked
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 opacity-50'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <badge.icon className={clsx('w-5 h-5', badge.color)} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                <p className="text-[11px] text-indigo-200/70 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const NotesPage: React.FC = () => {
  const language = useCurrentLanguage();
  const [notes, setNotes] = useState([
    { id: 1, text: translate(language, 'notes.sample.one'), done: false, tag: 'Học tập' },
    { id: 2, text: translate(language, 'notes.sample.two'), done: true, tag: 'Công việc' },
  ]);
  const [text, setText] = useState('');

  const addNote = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    setNotes((prev) => [{ id: Date.now(), text: trimmedText, done: false, tag: 'Ghi chú' }, ...prev]);
    setText('');
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {translate(language, 'notes.title')}
            </h1>
            <p className="text-sm text-indigo-100/90 font-medium">{translate(language, 'notes.subtitle')}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-extrabold text-indigo-100 border border-white/15 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          {notes.filter((note) => note.done).length}/{notes.length} hoàn thành
        </span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addNote();
            }}
            placeholder={translate(language, 'notes.placeholder')}
            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs sm:text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
          />
          <button
            onClick={addNote}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-xs sm:text-sm font-extrabold text-white transition hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {translate(language, 'notes.save')}
          </button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <article
            key={note.id}
            className={clsx(
              'group relative flex items-start gap-3.5 p-5 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5',
              note.done ? 'bg-slate-50/80 border-slate-200/60' : 'bg-white border-slate-200/80 hover:border-indigo-200'
            )}
          >
            <button
              onClick={() => setNotes((prev) => prev.map((item) => item.id === note.id ? { ...item, done: !item.done } : item))}
              className={`mt-0.5 cursor-pointer transition-colors ${note.done ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {note.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 mb-1.5">
                {note.tag}
              </span>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${note.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {note.text}
              </p>
            </div>
            <button
              onClick={() => setNotes((prev) => prev.filter((item) => item.id !== note.id))}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

const weeklyData = [
  { label: 'T2', value: 68 },
  { label: 'T3', value: 82 },
  { label: 'T4', value: 54 },
  { label: 'T5', value: 76 },
  { label: 'T6', value: 91 },
  { label: 'T7', value: 60 },
  { label: 'CN', value: 72 },
];

export const ReportsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const bestDay = useMemo(() => weeklyData.reduce((best, day) => day.value > best.value ? day : best), []);

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/10">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {translate(language, 'reports.title')}
            </h1>
            <p className="text-sm text-indigo-100/90 font-medium">{translate(language, 'reports.subtitle')}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-extrabold text-indigo-100 border border-white/15 backdrop-blur-md">
          <TrendingUp className="h-4 w-4 text-emerald-300" />
          Trung bình: 72 điểm
        </span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: translate(language, 'reports.completedTasks'), value: '24', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: translate(language, 'reports.bestDay'), value: bestDay.label, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
          { label: translate(language, 'reports.activeGoals'), value: '4', icon: Flag, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        ].map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className={`mb-3 w-10 h-10 rounded-2xl border ${item.bg} ${item.color} flex items-center justify-center`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 font-heading">{item.value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{item.label}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              {translate(language, 'reports.weeklyScore')}
            </h2>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Trung bình: 72 điểm
          </span>
        </div>

        <div className="flex h-64 items-end gap-3 pt-4">
          {weeklyData.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-black text-indigo-600">{day.value}%</span>
              <div className="flex h-52 w-full items-end rounded-2xl bg-slate-100 p-1.5">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500 hover:brightness-110"
                  style={{ height: `${day.value}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-slate-600">{day.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
