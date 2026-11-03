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

const bannerTones: Record<
  NonNullable<UserHeroBannerProps['tone']>,
  { gradient: string; glow: string; accentBorder: string; iconBg: string }
> = {
  dashboard: {
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    glow: 'bg-indigo-500/20',
    accentBorder: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30',
  },
  calendar: {
    gradient: 'from-slate-950 via-sky-950 to-slate-900',
    glow: 'bg-cyan-500/20',
    accentBorder: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30',
  },
  timetable: {
    gradient: 'from-slate-950 via-teal-950 to-slate-900',
    glow: 'bg-emerald-500/20',
    accentBorder: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  },
  tasks: {
    gradient: 'from-slate-950 via-amber-950 to-slate-900',
    glow: 'bg-amber-500/20',
    accentBorder: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  },
  assistant: {
    gradient: 'from-slate-950 via-purple-950 to-slate-900',
    glow: 'bg-fuchsia-500/20',
    accentBorder: 'border-fuchsia-500/20',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30',
  },
  goals: {
    gradient: 'from-slate-950 via-rose-950 to-slate-900',
    glow: 'bg-rose-500/20',
    accentBorder: 'border-rose-500/20',
    iconBg: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  },
  notes: {
    gradient: 'from-slate-950 via-teal-950 to-slate-900',
    glow: 'bg-teal-500/20',
    accentBorder: 'border-teal-500/20',
    iconBg: 'bg-teal-500/15 text-teal-200 border-teal-400/30',
  },
  reports: {
    gradient: 'from-slate-950 via-blue-950 to-slate-900',
    glow: 'bg-blue-500/20',
    accentBorder: 'border-blue-500/20',
    iconBg: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  },
  notifications: {
    gradient: 'from-slate-950 via-fuchsia-950 to-slate-900',
    glow: 'bg-pink-500/20',
    accentBorder: 'border-pink-500/20',
    iconBg: 'bg-pink-500/15 text-pink-200 border-pink-400/30',
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
    <section
      className={clsx(
        'relative flex min-h-36 sm:min-h-40 w-full overflow-hidden rounded-2xl sm:rounded-3xl border bg-gradient-to-br px-5 sm:px-8 py-5 sm:py-6 text-white shadow-xl shadow-slate-950/15 ring-1 ring-inset ring-white/10 transition-all duration-300',
        selectedTone.gradient,
        selectedTone.accentBorder
      )}
    >
      {/* Background Decorative Mesh & Glows */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div
        className={clsx(
          'pointer-events-none absolute -bottom-28 left-8 h-60 w-60 rounded-full blur-3xl opacity-60',
          selectedTone.glow
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Main Content Layout */}
      <div className="relative flex w-full flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between self-center">
        {/* Left: Icon & Text content */}
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          {/* Icon Badge */}
          <div
            className={clsx(
              'flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-md shadow-lg shadow-black/20',
              selectedTone.iconBg
            )}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-xs" strokeWidth={2} />
          </div>

          {/* Text & Badges */}
          <div className="min-w-0 flex-1">
            {(badge || badges) && (
              <div className="flex max-w-full flex-wrap items-center gap-2 pb-1">
                {badge && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md shadow-xs">
                    {badge}
                  </span>
                )}
                {badges}
              </div>
            )}

            <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-heading leading-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1.5 max-w-3xl text-xs sm:text-sm font-normal leading-relaxed text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex w-full lg:w-auto shrink-0 flex-wrap sm:flex-nowrap items-center gap-2.5 lg:justify-end mt-2 lg:mt-0">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
};
