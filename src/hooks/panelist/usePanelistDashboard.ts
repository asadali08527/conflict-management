import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/panelist/dashboardService';
import { PaginationParams } from '@/services/panelist/api';

export const usePanelistDashboard = () => {
  // Get dashboard stats
  const statsQuery = useQuery({
    queryKey: ['panelist-dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get recent activity
  const activityQuery = useQuery({
    queryKey: ['panelist-recent-activity'],
    queryFn: () => dashboardService.getRecentActivity({ limit: 20 }),
    refetchInterval: 60000, // Refetch every minute
  });

  // Get upcoming meetings
  const upcomingMeetingsQuery = useQuery({
    queryKey: ['panelist-upcoming-meetings'],
    queryFn: () => dashboardService.getUpcomingMeetings({ limit: 10 }),
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    stats: statsQuery.data?.data,
    isLoadingStats: statsQuery.isLoading,
    statsError: statsQuery.error,

    activities: activityQuery.data?.data?.activities || [],
    activityCount: activityQuery.data?.data?.count || 0,
    isLoadingActivity: activityQuery.isLoading,
    activityError: activityQuery.error,

    upcomingMeetings: upcomingMeetingsQuery.data?.data?.meetings || [],
    isLoadingMeetings: upcomingMeetingsQuery.isLoading,
    meetingsError: upcomingMeetingsQuery.error,

    refetchAll: () => {
      statsQuery.refetch();
      activityQuery.refetch();
      upcomingMeetingsQuery.refetch();
    },
  };
};
