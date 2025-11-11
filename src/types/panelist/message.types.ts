// Panelist Message Types

export interface MessageRecipient {
  recipientType: 'party' | 'panelist' | 'admin' | 'all_parties';
  name: string;
  email: string;
}

export interface MessageAttachment {
  name: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

export interface Message {
  _id: string;
  caseId: string;
  caseTitle?: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    role: string;
    email: string;
  };
  recipients: MessageRecipient[];
  messageType: 'general' | 'meeting_notification' | 'case_update' | 'resolution_request';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  caseId: string;
  subject: string;
  content: string;
  recipients: MessageRecipient[];
  messageType: 'general' | 'meeting_notification' | 'case_update' | 'resolution_request';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: MessageAttachment[];
}

export interface ListMessagesParams {
  page?: number;
  limit?: number;
  caseId?: string;
  unreadOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MessagesListResponse {
  status: string;
  data: {
    messages: Message[];
    unreadCount: number;
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    unreadCount: number;
  };
}

export interface MessageResponse {
  status: string;
  data: {
    message: Message;
  };
}
