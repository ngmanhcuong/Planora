import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogoutModal } from './LogoutModal';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E]">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={clsx(
          'pt-20 pb-12 px-6 transition-all duration-300 ease-in-out min-h-screen',
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Modals */}
      <LogoutModal />
    </div>
  );
};
