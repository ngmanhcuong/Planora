import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { TimetablePage } from '@/features/timetable/TimetablePage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { AssistantPage, GoalsPage, NotesPage, ReportsPage } from '@/features/tools/ToolPages';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

interface GuardProps {
  children: React.ReactElement;
}

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  if (isInitializing) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return children;
};

const RoleHomeRedirect: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
};

const AdminOnlyRoute: React.FC<GuardProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

const UserOnlyRoute: React.FC<GuardProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
};

export const AppRouter: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><LoginPage initialMode="forgot" /></PublicRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/admin" element={<AdminOnlyRoute><AdminDashboardPage /></AdminOnlyRoute>} />
          <Route path="/dashboard" element={<UserOnlyRoute><DashboardPage /></UserOnlyRoute>} />
          <Route path="/calendar" element={<UserOnlyRoute><CalendarPage /></UserOnlyRoute>} />
          <Route path="/timetable" element={<UserOnlyRoute><TimetablePage /></UserOnlyRoute>} />
          <Route path="/tasks" element={<UserOnlyRoute><TasksPage /></UserOnlyRoute>} />
          <Route path="/notifications" element={<UserOnlyRoute><NotificationsPage /></UserOnlyRoute>} />
          <Route path="/assistant" element={<UserOnlyRoute><AssistantPage /></UserOnlyRoute>} />
          <Route path="/goals" element={<UserOnlyRoute><GoalsPage /></UserOnlyRoute>} />
          <Route path="/notes" element={<UserOnlyRoute><NotesPage /></UserOnlyRoute>} />
          <Route path="/reports" element={<UserOnlyRoute><ReportsPage /></UserOnlyRoute>} />
          <Route path="/profile" element={<UserOnlyRoute><ProfilePage /></UserOnlyRoute>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};
