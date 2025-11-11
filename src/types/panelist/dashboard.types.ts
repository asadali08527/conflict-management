// Panelist Dashboard Types

export interface DashboardStats {
  activeCases: number;
  casesNeedingResolution: number;
  resolvedCases: number;
  upcomingMeetings: number;
  unreadMessages: number;
  currentCaseLoad: number;
  maxCases: number;
  capacityPercentage: number;
}

export interface DashboardStatsResponse {
  status: string;
  data: DashboardStats;
}

export interface RecentActivity {
  _id: string;
  type: 'case_assigned' | 'resolution_submitted' | 'meeting_scheduled' | 'message_received' | 'note_added' | 'document_uploaded';
  description: string;
  caseId?: string;
  caseTitle?: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface RecentActivityResponse {
  status: string;
  data: {
    activities: RecentActivity[];
    count: number;
  };
}

export interface UpcomingMeeting {
  _id: string;
  title: string;
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  caseId: string;
  caseTitle?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface UpcomingMeetingsResponse {
  status: string;
  data: {
    meetings: UpcomingMeeting[];
  };
}
