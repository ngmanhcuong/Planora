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
  Sparkles,
  Award,
} from 'lucide-react';
import { AiAssistantPanel } from '@/features/ai';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

const cardClass = 'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm';
const mutedText = 'text-xs sm:text-sm text-slate-500 font-medium';

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-200 backdrop-blur-md border border-white/15">
              <Bot className="h-4 w-4 text-indigo-300" />
              {translate(language, 'assistant.badge')}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {translate(language, 'assistant.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed">
              {translate(language, 'assistant.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:opacity-95 transition-all cursor-pointer"
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
            className={`${cardClass} flex items-start gap-3.5 p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md cursor-pointer group`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
  const initialGoals = useMemo(() => [
    { id: 1, title: translate(language, 'goals.sample.one'), progress: 75 },
    { id: 2, title: translate(language, 'goals.sample.two'), progress: 50 },
    { id: 3, title: translate(language, 'goals.sample.three'), progress: 90 },
  ], [language]);
  const [goals, setGoals] = useState(initialGoals);
  const [title, setTitle] = useState('');

  const averageProgress = goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;

  const addGoal = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setGoals((prev) => [...prev, { id: Date.now(), title: trimmedTitle, progress: 0 }]);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                {translate(language, 'goals.title')}
              </h1>
              <p className={mutedText}>{translate(language, 'goals.subtitle')}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 px-6 py-3 text-center">
            <p className="text-xs font-bold text-slate-500">
              {translate(language, 'goals.averageProgress')}
            </p>
            <p className="text-2xl font-black text-indigo-600 font-heading">{averageProgress}%</p>
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-4`}>
        <div className="flex gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addGoal(); }}
            placeholder={translate(language, 'goals.addPlaceholder')}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs sm:text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
          />
          <button
            onClick={addGoal}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs sm:text-sm font-bold text-white transition hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            {translate(language, 'goals.add')}
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {goals.map((goal) => (
          <article key={goal.id} className={`${cardClass} p-5 hover:shadow-md transition-all`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold leading-snug text-slate-900">{goal.title}</h2>
              </div>
              <button
                onClick={() => setGoals((prev) => prev.filter((item) => item.id !== goal.id))}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>{translate(language, 'goals.progress')}</span>
              <span className="text-indigo-600 font-extrabold">{goal.progress}%</span>
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
      <section className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">
              {translate(language, 'notes.title')}
            </h1>
            <p className={mutedText}>{translate(language, 'notes.subtitle')}</p>
          </div>
        </div>
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
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs sm:text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
          />
          <button
            onClick={addNote}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs sm:text-sm font-bold text-white transition hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            {translate(language, 'notes.save')}
          </button>
        </div>
      </section>

      <div className="space-y-3">
        {notes.map((note) => (
          <article key={note.id} className={`${cardClass} flex items-center gap-3 p-4 hover:border-slate-300 transition-all`}>
            <button
              onClick={() => setNotes((prev) => prev.map((item) => item.id === note.id ? { ...item, done: !item.done } : item))}
              className={`cursor-pointer ${note.done ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {note.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <p className={`flex-1 text-xs sm:text-sm font-medium ${note.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{note.text}</p>
            <button
              onClick={() => setNotes((prev) => prev.filter((item) => item.id !== note.id))}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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
      <section className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">
              {translate(language, 'reports.title')}
            </h1>
            <p className={mutedText}>{translate(language, 'reports.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: translate(language, 'reports.completedTasks'), value: '24', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: translate(language, 'reports.bestDay'), value: bestDay.label, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: translate(language, 'reports.activeGoals'), value: '3', icon: Flag, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item) => (
          <article key={item.label} className={`${cardClass} p-5 hover:-translate-y-1 transition-all`}>
            <div className={`mb-3 w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 font-heading">{item.value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{item.label}</p>
          </article>
        ))}
      </div>

      <section className={`${cardClass} p-6`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              {translate(language, 'reports.weeklyScore')}
            </h2>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
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





