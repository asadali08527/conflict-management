import apiClient, { ApiResponse, PaginationParams, PaginationResponse } from './api';
import { Message, SendMessagePayload } from '@/types/panelist/message.types';

export interface MessageListParams extends PaginationParams {
  caseId?: string;
  unreadOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const messageService = {
  // Get list of messages
  getMessages: async (
    params: MessageListParams = {}
  ): Promise<
    ApiResponse<{
      messages: Message[];
      unreadCount: number;
      pagination: PaginationResponse;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        messages: Message[];
        unreadCount: number;
        pagination: PaginationResponse;
      }>
    >('/api/panelist/messages', { params });
    return response.data;
  },

  // Get case messages
  getCaseMessages: async (
    caseId: string,
    params: PaginationParams = {}
  ): Promise<
    ApiResponse<{ messages: Message[]; pagination: PaginationResponse }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{ messages: Message[]; pagination: PaginationResponse }>
    >(`/api/panelist/messages/cases/${caseId}`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (
    payload: SendMessagePayload
  ): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      '/api/panelist/messages/send',
      payload
    );
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(
      `/api/panelist/messages/${messageId}/read`
    );
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      '/api/panelist/messages/unread-count'
    );
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/panelist/messages/${messageId}`
    );
    return response.data;
  },
};
