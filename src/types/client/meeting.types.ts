/**
 * Client Meeting Types
 * Based on CLIENT_API_DOCUMENTATION.md
 */

export type MeetingType = 'video' | 'phone' | 'in_person';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  case: {
    _id: string;
    title: string;
    caseId: string;
    type: string;
    status?: string;
    description?: string;
  };
  scheduledBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDate: string;
  duration: number;
  meetingType: MeetingType;
  meetingLink?: string;
  location?: string;
  status: MeetingStatus;
  notes?: string;
  attendees?: Attendee[];
}

export interface Attendee {
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  name: string;
  email: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  isParty: boolean;
}

export interface MeetingsListResponse {
  meetings: Meeting[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MeetingDetailResponse {
  meeting: Meeting;
}

export interface GetMeetingsParams {
  page?: number;
  limit?: number;
  status?: MeetingStatus;
  upcoming?: boolean;
}
