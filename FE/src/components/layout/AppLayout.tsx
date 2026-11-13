import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { LogoutModal } from './LogoutModal';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';
import { Bot, Sparkles, X } from 'lucide-react';
import { AiAssistantPanel } from '@/features/ai';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, isAiChatOpen, toggleAiChat, closeAiChat } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-main)] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Header (Desktop + Mobile) */}
      <Header />

      {/* Main Content Area */}
      <main
        className={clsx(
          'pt-16 sm:pt-20 pb-24 lg:pb-12 px-3 sm:px-6 transition-all duration-300 ease-in-out min-h-screen',
          'ml-0',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Global Floating AI Chat Trigger Bubble */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={toggleAiChat}
          aria-label={isAiChatOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI Planora'}
          className={clsx(
            'group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ease-out active:scale-90 cursor-pointer',
            isAiChatOpen
              ? 'bg-rose-500 text-white shadow-rose-500/30 rotate-90 hover:bg-rose-600'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-indigo-600/40 hover:scale-110 hover:shadow-indigo-600/50'
          )}
        >
          {isAiChatOpen ? (
            <X className="h-6 w-6 transition-transform duration-200 -rotate-90" />
          ) : (
            <>
              <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
              {/* Online Pulse Dot */}
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
              {/* Sparkle icon */}
              <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-xs ring-2 ring-white dark:ring-slate-900">
                <Sparkles className="h-2.5 w-2.5 fill-slate-950" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Global AI Chatbox Popup */}
      <AiAssistantPanel isOpen={isAiChatOpen} onClose={closeAiChat} />

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileNavigation />

      {/* Global Modals */}
      <LogoutModal />
    </div>
  );
};
