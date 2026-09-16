import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Logo } from '@/components/ui/Logo';

export interface AuthLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  topRightLink?: {
    text: string;
    linkText: string;
    href: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, topRightLink }) => {
  return (
    <div className="min-h-screen lg:h-screen w-full overflow-y-auto bg-[#FAFAFA] text-slate-800 font-sans flex flex-col justify-between antialiased selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Background Texture & Soft Ambient Illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-100/30 via-indigo-50/10 to-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between relative z-10 shrink-0 border-b border-slate-200/50 sm:border-none">
        <Logo size="md" theme="light" />

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          {topRightLink && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="text-slate-500">{topRightLink.text}</span>
              <a
                href={topRightLink.href}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                {topRightLink.linkText}
              </a>
            </div>
          )}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 font-medium transition-colors shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Trợ giúp
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-2 sm:py-3 relative z-10 min-h-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 relative z-10 shrink-0">
        <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản dịch vụ</a>
        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
        <a href="#" className="hover:text-slate-600 transition-colors">Chính sách bảo mật</a>
        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
        <a href="#" className="hover:text-slate-600 transition-colors">Hệ thống trạng thái</a>
      </footer>
    </div>
  );
};
