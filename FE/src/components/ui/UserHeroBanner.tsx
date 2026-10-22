import React from 'react';
import { clsx } from 'clsx';

interface UserHeroBannerProps {
  icon: React.ElementType;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'dashboard' | 'calendar' | 'timetable' | 'tasks' | 'assistant' | 'goals' | 'notes' | 'reports' | 'notifications';
}

const bannerTones: Record<NonNullable<UserHeroBannerProps['tone']>, { gradient: string; glow: string }> = {
  dashboard: {
    gradient: 'from-indigo-950 via-violet-900 to-slate-950',
    glow: 'bg-indigo-400/10',
  },
  calendar: {
    gradient: 'from-sky-950 via-cyan-900 to-slate-950',
    glow: 'bg-cyan-300/12',
  },
  timetable: {
    gradient: 'from-emerald-950 via-teal-900 to-slate-950',
    glow: 'bg-emerald-300/12',
  },
  tasks: {
    gradient: 'from-orange-950 via-amber-900 to-slate-950',
    glow: 'bg-amber-300/12',
  },
  assistant: {
    gradient: 'from-purple-950 via-violet-900 to-fuchsia-950',
    glow: 'bg-fuchsia-300/12',
  },
  goals: {
    gradient: 'from-rose-950 via-pink-900 to-slate-950',
    glow: 'bg-rose-300/12',
  },
  notes: {
    gradient: 'from-teal-950 via-cyan-900 to-slate-950',
    glow: 'bg-teal-300/12',
  },
  reports: {
    gradient: 'from-sky-950 via-blue-900 to-cyan-950',
    glow: 'bg-cyan-300/12',
  },
  notifications: {
    gradient: 'from-fuchsia-950 via-rose-950 to-slate-950',
    glow: 'bg-pink-300/12',
  },
};

export const UserHeroBanner: React.FC<UserHeroBannerProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  badges,
  actions,
  tone = 'dashboard',
}) => {
  const selectedTone = bannerTones[tone];
  return (
    <section className={clsx('relative flex min-h-36 sm:min-h-40 w-full overflow-hidden rounded-2xl sm:rounded-[1.75rem] border border-white/10 bg-gradient-to-br px-4 sm:px-7 py-5 sm:py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]', selectedTone.gradient)}>
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%)]" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className={clsx('pointer-events-none absolute -bottom-24 left-12 h-52 w-52 rounded-full blur-3xl', selectedTone.glow)} />

      <div className="relative flex w-full flex-col gap-4 sm:gap-5 self-center lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/25 bg-white/12 shadow-lg shadow-black/10 backdrop-blur-sm">
            <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            {(badge || badges) && (
              <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2 pb-0.5">
                {badge && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md">
                    {badge}
                  </span>
                )}
                {badges}
              </div>
            )}

            <h1 className="mt-2 sm:mt-3 max-w-5xl text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em] text-white">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1.5 sm:mt-2 max-w-4xl text-xs sm:text-sm font-medium leading-5 sm:leading-6 text-white/80">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 lg:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
};
