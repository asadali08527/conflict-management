import apiClient, { ApiResponse, PaginationParams } from './api';
import { DashboardStats, RecentActivity, UpcomingMeeting } from '@/types/panelist/dashboard.types';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/api/panelist/dashboard/stats'
    );
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (
    params: PaginationParams = {}
  ): Promise<ApiResponse<{ activities: RecentActivity[]; count: number }>> => {
    const response = await apiClient.get<
      ApiResponse<{ activities: RecentActivity[]; count: number }>
    >('/api/panelist/dashboard/recent-activity', { params });
    return response.data;
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (
    params: PaginationParams = {}
  ): Promise<ApiResponse<{ meetings: UpcomingMeeting[] }>> => {
    const response = await apiClient.get<ApiResponse<{ meetings: UpcomingMeeting[] }>>(
      '/api/panelist/dashboard/upcoming-meetings',
      { params }
    );
    return response.data;
  },
};
