// Panelist Meeting Types

export interface MeetingAttendee {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isParty: boolean;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  caseId: string;
  caseTitle?: string;
  attendees: MeetingAttendee[];
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: {
    notes: string;
    outcome?: string;
    nextSteps?: string;
  };
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  caseId: string;
  attendees: MeetingAttendee[];
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
}

export interface UpdateMeetingPayload {
  title?: string;
  description?: string;
  scheduledDate?: string;
  duration?: number;
  meetingLink?: string;
  location?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface MeetingNotesPayload {
  notes: string;
  outcome?: string;
  nextSteps?: string;
}

export interface ListMeetingsParams {
  page?: number;
  limit?: number;
  status?: string;
  caseId?: string;
  upcoming?: boolean;
  past?: boolean;
}

export interface MeetingsListResponse {
  status: string;
  data: {
    meetings: Meeting[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface MeetingResponse {
  status: string;
  data: {
    meeting: Meeting;
  };
}
