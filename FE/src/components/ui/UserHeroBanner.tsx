import React from 'react';
import { clsx } from 'clsx';

interface UserHeroBannerProps {
  icon: React.ElementType;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  iconClassName?: string;
  tone?: 'dashboard' | 'calendar' | 'timetable' | 'tasks' | 'assistant' | 'goals' | 'notes' | 'reports' | 'notifications';
}

const bannerTones: Record<NonNullable<UserHeroBannerProps['tone']>, { gradient: string; glow: string; icon: string }> = {
  dashboard: {
    gradient: 'from-indigo-950 via-violet-900 to-slate-950',
    glow: 'bg-indigo-400/10',
    icon: 'text-amber-300',
  },
  calendar: {
    gradient: 'from-sky-950 via-cyan-900 to-slate-950',
    glow: 'bg-cyan-300/12',
    icon: 'text-cyan-100',
  },
  timetable: {
    gradient: 'from-emerald-950 via-teal-900 to-slate-950',
    glow: 'bg-emerald-300/12',
    icon: 'text-emerald-100',
  },
  tasks: {
    gradient: 'from-orange-950 via-amber-900 to-slate-950',
    glow: 'bg-amber-300/12',
    icon: 'text-amber-100',
  },
  assistant: {
    gradient: 'from-purple-950 via-violet-900 to-fuchsia-950',
    glow: 'bg-fuchsia-300/12',
    icon: 'text-fuchsia-100',
  },
  goals: {
    gradient: 'from-rose-950 via-pink-900 to-slate-950',
    glow: 'bg-rose-300/12',
    icon: 'text-rose-100',
  },
  notes: {
    gradient: 'from-teal-950 via-cyan-900 to-slate-950',
    glow: 'bg-teal-300/12',
    icon: 'text-teal-100',
  },
  reports: {
    gradient: 'from-sky-950 via-blue-900 to-cyan-950',
    glow: 'bg-cyan-300/12',
    icon: 'text-sky-100',
  },
  notifications: {
    gradient: 'from-fuchsia-950 via-rose-950 to-slate-950',
    glow: 'bg-pink-300/12',
    icon: 'text-pink-100',
  },
};

export const UserHeroBanner: React.FC<UserHeroBannerProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  badges,
  actions,
  iconClassName,
  tone = 'dashboard',
}) => {
  const selectedTone = bannerTones[tone];
  return (
  <section className={clsx('relative flex min-h-40 w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br px-7 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]', selectedTone.gradient)}>
    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%)]" />
    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    <div className={clsx('pointer-events-none absolute -bottom-24 left-12 h-52 w-52 rounded-full blur-3xl', selectedTone.glow)} />

    <div className="relative flex w-full flex-col gap-5 self-center lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/12 shadow-2xl shadow-black/10 backdrop-blur-md">
          <Icon className={clsx('h-8 w-8', iconClassName || selectedTone.icon)} />
        </div>

        <div className="min-w-0">
          {(badge || badges) && (
            <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {badge && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
                  {badge}
                </span>
              )}
              {badges}
            </div>
          )}

          <h1 className="mt-3 max-w-5xl text-2xl font-bold leading-tight tracking-[-0.02em] text-white md:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-white/80">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex max-w-full shrink-0 flex-nowrap items-center gap-2.5 overflow-x-auto lg:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {actions}
        </div>
      )}
    </div>
  </section>
);
};
