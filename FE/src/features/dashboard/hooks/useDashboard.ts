import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  weeklyStats: (date?: string) => ['dashboard', 'weekly', date] as const,
  monthlyStats: (month?: string) => ['dashboard', 'monthly', month] as const,
};

export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: () => dashboardApi.getDashboard(),
  });
};

export const useWeeklyStats = (date?: string) => {
  return useQuery({
    queryKey: dashboardKeys.weeklyStats(date),
    queryFn: () => dashboardApi.getWeeklyStats(date),
  });
};

export const useMonthlyStats = (month?: string) => {
  return useQuery({
    queryKey: dashboardKeys.monthlyStats(month),
    queryFn: () => dashboardApi.getMonthlyStats(month),
  });
};
