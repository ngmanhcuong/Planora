import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { LogoutModal } from './LogoutModal';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
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

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileNavigation />

      {/* Global Modals */}
      <LogoutModal />
    </div>
  );
};
