import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Circle,
  Flag,
  Lightbulb,
  Plus,
  Send,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { AiAssistantPanel } from '@/features/ai';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

const cardClass = 'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm';
const mutedText = 'text-sm text-[var(--color-text-sub)]';

export const AssistantPage: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const language = useCurrentLanguage();
  const promptCards = [
    translate(language, 'assistant.prompt.today'),
    translate(language, 'assistant.prompt.week'),
    translate(language, 'assistant.prompt.breakdown'),
  ];

  return (
    <div className="space-y-6">
      <section className="assistant-hero rounded-3xl border border-[#C7D2FE]/70 bg-gradient-to-br from-[#EEF2FF] via-white to-[#EFF6FF] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="assistant-hero-badge mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4F46E5] ring-1 ring-[#C7D2FE]">
              <Bot className="h-4 w-4" />
              {translate(language, 'assistant.badge')}
            </div>
            <h1 className="assistant-hero-title font-heading text-2xl font-extrabold text-[#131B2E]">
              {translate(language, 'assistant.title')}
            </h1>
            <p className={`assistant-hero-subtitle ${mutedText} mt-2 max-w-2xl`}>
              {translate(language, 'assistant.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA]"
          >
            <Send className="h-4 w-4" />
            {translate(language, 'assistant.open')}
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {promptCards.map((text) => (
          <button
            key={text}
            onClick={() => setIsAssistantOpen(true)}
            className={`${cardClass} flex items-start gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-md`}
          >
            <Lightbulb className="mt-0.5 h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-[#131B2E]">{text}</span>
          </button>
        ))}
      </div>

      <AiAssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export const GoalsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const initialGoals = useMemo(() => [
    { id: 1, title: translate(language, 'goals.sample.one'), progress: 75 },
    { id: 2, title: translate(language, 'goals.sample.two'), progress: 50 },
    { id: 3, title: translate(language, 'goals.sample.three'), progress: 90 },
  ], [language]);
  const [goals, setGoals] = useState(initialGoals);
  const [title, setTitle] = useState('');

  const averageProgress = Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length);

  const addGoal = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setGoals((prev) => [...prev, { id: Date.now(), title: trimmedTitle, progress: 0 }]);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <section className={`${cardClass} p-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-[#131B2E]">
              {translate(language, 'goals.title')}
            </h1>
            <p className={`${mutedText} mt-1`}>{translate(language, 'goals.subtitle')}</p>
          </div>
          <div className="rounded-2xl bg-[#EEF2FF] px-5 py-3 text-center">
            <p className="text-xs font-semibold text-[#64748B]">
              {translate(language, 'goals.averageProgress')}
            </p>
            <p className="text-2xl font-extrabold text-[#4F46E5]">{averageProgress}%</p>
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-4`}>
        <div className="flex gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={translate(language, 'goals.addPlaceholder')}
            className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition focus:border-[#4F46E5] focus:bg-white"
          />
          <button
            onClick={addGoal}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-4 text-sm font-semibold text-white transition hover:bg-[#4338CA]"
          >
            <Plus className="h-4 w-4" />
            {translate(language, 'goals.add')}
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {goals.map((goal) => (
          <article key={goal.id} className={`${cardClass} p-5`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold leading-snug text-[#131B2E]">{goal.title}</h2>
              </div>
              <button
                onClick={() => setGoals((prev) => prev.filter((item) => item.id !== goal.id))}
                className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#FFF1F2] hover:text-[#E11D48]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress}
              onChange={(event) => {
                const progress = Number(event.target.value);
                setGoals((prev) => prev.map((item) => item.id === goal.id ? { ...item, progress } : item));
              }}
              className="w-full accent-[#4F46E5]"
            />
            <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>{translate(language, 'goals.progress')}</span>
              <span>{goal.progress}%</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const NotesPage: React.FC = () => {
  const language = useCurrentLanguage();
  const [notes, setNotes] = useState([
    { id: 1, text: translate(language, 'notes.sample.one'), done: false },
    { id: 2, text: translate(language, 'notes.sample.two'), done: true },
  ]);
  const [text, setText] = useState('');

  const addNote = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    setNotes((prev) => [{ id: Date.now(), text: trimmedText, done: false }, ...prev]);
    setText('');
  };

  return (
    <div className="space-y-6">
      <section className={`${cardClass} p-6`}>
        <h1 className="font-heading text-2xl font-extrabold text-[#131B2E]">
          {translate(language, 'notes.title')}
        </h1>
        <p className={`${mutedText} mt-1`}>{translate(language, 'notes.subtitle')}</p>
      </section>

      <section className={`${cardClass} p-4`}>
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addNote();
            }}
            placeholder={translate(language, 'notes.placeholder')}
            className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition focus:border-[#4F46E5] focus:bg-white"
          />
          <button
            onClick={addNote}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#4F46E5] px-4 text-sm font-semibold text-white transition hover:bg-[#4338CA]"
          >
            <Plus className="h-4 w-4" />
            {translate(language, 'notes.save')}
          </button>
        </div>
      </section>

      <div className="space-y-3">
        {notes.map((note) => (
          <article key={note.id} className={`${cardClass} flex items-center gap-3 p-4`}>
            <button
              onClick={() => setNotes((prev) => prev.map((item) => item.id === note.id ? { ...item, done: !item.done } : item))}
              className={note.done ? 'text-emerald-600' : 'text-[#94A3B8]'}
            >
              {note.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <p className={`flex-1 text-sm ${note.done ? 'text-[#94A3B8] line-through' : 'text-[#131B2E]'}`}>{note.text}</p>
            <button
              onClick={() => setNotes((prev) => prev.filter((item) => item.id !== note.id))}
              className="rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-[#FFF1F2] hover:text-[#E11D48]"
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
    <div className="space-y-6">
      <section className={`${cardClass} p-6`}>
        <h1 className="font-heading text-2xl font-extrabold text-[#131B2E]">
          {translate(language, 'reports.title')}
        </h1>
        <p className={`${mutedText} mt-1`}>{translate(language, 'reports.subtitle')}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: translate(language, 'reports.completedTasks'), value: '24', icon: CheckCircle2 },
          { label: translate(language, 'reports.bestDay'), value: bestDay.label, icon: TrendingUp },
          { label: translate(language, 'reports.activeGoals'), value: '3', icon: Flag },
        ].map((item) => (
          <article key={item.label} className={`${cardClass} p-5`}>
            <item.icon className="mb-4 h-6 w-6 text-[#4F46E5]" />
            <p className="text-2xl font-extrabold text-[#131B2E]">{item.value}</p>
            <p className="text-sm font-medium text-[#64748B]">{item.label}</p>
          </article>
        ))}
      </div>

      <section className={`${cardClass} p-6`}>
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#4F46E5]" />
          <h2 className="font-heading text-lg font-bold text-[#131B2E]">
            {translate(language, 'reports.weeklyScore')}
          </h2>
        </div>
        <div className="flex h-64 items-end gap-3">
          {weeklyData.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-52 w-full items-end rounded-xl bg-[#F1F5F9] p-1">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-[#4F46E5] to-[#60A5FA]"
                  style={{ height: `${day.value}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#64748B]">{day.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};




