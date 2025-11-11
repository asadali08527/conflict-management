/**
 * Client Dashboard Types
 * Based on CLIENT_API_DOCUMENTATION.md
 */

export interface DashboardStats {
  overview: {
    totalCases: number;
    openCases: number;
    assignedCases: number;
    inProgressCases: number;
    resolvedCases: number;
    upcomingMeetings: number;
    recentActivityCount: number;
  };
  caseDistribution: {
    [key: string]: number;
  };
  latestUpdate: LatestUpdate | null;
}

export interface LatestUpdate {
  caseTitle: string;
  caseId: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
}

export type ActivityType =
  | 'case_created'
  | 'status_change'
  | 'panelist_assigned'
  | 'panel_removed'
  | 'note_added'
  | 'document_added'
  | 'meeting_scheduled'
  | 'meeting_updated'
  | 'meeting_cancelled'
  | 'party_b_responded'
  | 'resolution_submitted'
  | 'case_resolved'
  | 'case_closed';

export interface Activity {
  _id: string;
  case: {
    _id: string;
    title: string;
    caseId: string;
    type: string;
    status: string;
  };
  activityType: ActivityType;
  description: string;
  performedBy: {
    userId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    panelistId?: {
      _id: string;
      name: string;
      occupation: string;
    };
  };
  createdAt: string;
}

export interface RecentUpdatesResponse {
  activities: Activity[];
  count: number;
}

export interface UpcomingMeeting {
  _id: string;
  title: string;
  case: {
    _id: string;
    title: string;
    caseId: string;
    type: string;
  };
  scheduledBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface UpcomingMeetingsResponse {
  meetings: UpcomingMeeting[];
  count: number;
}
