/**
 * Client Dashboard Hooks
 * TanStack Query hooks for client dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/client/dashboardService';

/**
 * Hook to fetch dashboard statistics
 */
export const useClientDashboardStats = () => {
  return useQuery({
    queryKey: ['client-dashboard-stats'],
    queryFn: dashboardService.getDashboardStats,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch recent updates/activities
 */
export const useClientRecentUpdates = (limit: number = 20) => {
  return useQuery({
    queryKey: ['client-recent-updates', limit],
    queryFn: () => dashboardService.getRecentUpdates(limit),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch upcoming meetings
 */
export const useClientUpcomingMeetings = (limit: number = 10) => {
  return useQuery({
    queryKey: ['client-upcoming-meetings', limit],
    queryFn: () => dashboardService.getUpcomingMeetings(limit),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
