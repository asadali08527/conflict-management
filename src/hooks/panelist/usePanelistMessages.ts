import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, MessageListParams } from '@/services/panelist/messageService';
import { SendMessagePayload } from '@/types/panelist/message.types';
import { toast } from 'sonner';

export const usePanelistMessages = (params: MessageListParams = {}) => {
  const queryClient = useQueryClient();

  // Get messages list
  const messagesQuery = useQuery({
    queryKey: ['panelist-messages', params],
    queryFn: () => messageService.getMessages(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread count
  const unreadCountQuery = useQuery({
    queryKey: ['panelist-unread-count'],
    queryFn: () => messageService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => messageService.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-messages'] });
      toast.success('Message sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => messageService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-messages'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-dashboard-stats'] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-messages'] });
      toast.success('Message deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });

  return {
    messages: messagesQuery.data?.data?.messages || [],
    unreadCount: messagesQuery.data?.data?.unreadCount || unreadCountQuery.data?.data?.unreadCount || 0,
    pagination: messagesQuery.data?.data?.pagination,
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,

    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,

    markAsRead: markAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,

    deleteMessage: deleteMessageMutation.mutate,
    isDeleting: deleteMessageMutation.isPending,

    refetch: messagesQuery.refetch,
  };
};

export const usePanelistCaseMessages = (caseId: string) => {
  const queryClient = useQueryClient();

  // Get case messages
  const messagesQuery = useQuery({
    queryKey: ['panelist-case-messages', caseId],
    queryFn: () => messageService.getCaseMessages(caseId, { limit: 50 }),
    enabled: !!caseId,
  });

  return {
    messages: messagesQuery.data?.data?.messages || [],
    pagination: messagesQuery.data?.data?.pagination,
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    refetch: messagesQuery.refetch,
  };
};
