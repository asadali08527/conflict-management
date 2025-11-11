/**
 * Client Dashboard Service
 * Handles API calls for client dashboard data
 */

import { clientApiClient, ApiResponse, extractData } from './api';
import {
  DashboardStats,
  RecentUpdatesResponse,
  UpcomingMeetingsResponse,
} from '@/types/client/dashboard.types';

/**
 * Get dashboard statistics
 * GET /api/client/dashboard/stats
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await clientApiClient.get<ApiResponse<DashboardStats>>(
    '/api/client/dashboard/stats'
  );
  return extractData(response.data);
};

/**
 * Get recent activity updates
 * GET /api/client/dashboard/recent-updates
 */
export const getRecentUpdates = async (limit: number = 20): Promise<RecentUpdatesResponse> => {
  const response = await clientApiClient.get<ApiResponse<RecentUpdatesResponse>>(
    '/api/client/dashboard/recent-updates',
    { params: { limit } }
  );
  return extractData(response.data);
};

/**
 * Get upcoming meetings
 * GET /api/client/dashboard/upcoming-meetings
 */
export const getUpcomingMeetings = async (limit: number = 10): Promise<UpcomingMeetingsResponse> => {
  const response = await clientApiClient.get<ApiResponse<UpcomingMeetingsResponse>>(
    '/api/client/dashboard/upcoming-meetings',
    { params: { limit } }
  );
  return extractData(response.data);
};

// Export all services as a single object
export const dashboardService = {
  getDashboardStats,
  getRecentUpdates,
  getUpcomingMeetings,
};
