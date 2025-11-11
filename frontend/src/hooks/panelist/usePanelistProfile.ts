import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/panelist/profileService';
import {
  UpdateProfilePayload,
  UpdateAvailabilityPayload,
  UpdateProfilePicturePayload,
  UpdateAccountInfoPayload,
} from '@/types/panelist/profile.types';
import { toast } from 'sonner';
import { usePanelistAuth } from '@/contexts/PanelistAuthContext';

export const usePanelistProfile = () => {
  const queryClient = useQueryClient();
  const { updatePanelistInfo } = usePanelistAuth();

  // Get profile
  const profileQuery = useQuery({
    queryKey: ['panelist-profile'],
    queryFn: () => profileService.getProfile(),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['panelist-profile'] });
      if (response.data?.panelist) {
        updatePanelistInfo(response.data.panelist);
      }
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (payload: UpdateAvailabilityPayload) =>
      profileService.updateAvailability(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['panelist-profile'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-dashboard-stats'] });
      if (response.data?.panelist) {
        updatePanelistInfo(response.data.panelist);
      }
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Update profile picture mutation
  const updateProfilePictureMutation = useMutation({
    mutationFn: (payload: UpdateProfilePicturePayload) =>
      profileService.updateProfilePicture(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['panelist-profile'] });
      if (response.data?.panelist) {
        updatePanelistInfo(response.data.panelist);
      }
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    },
  });

  // Update account info mutation
  const updateAccountInfoMutation = useMutation({
    mutationFn: (payload: UpdateAccountInfoPayload) =>
      profileService.updateAccountInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-profile'] });
      toast.success('Account information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update account information');
    },
  });

  return {
    profile: profileQuery.data?.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    updateAvailability: updateAvailabilityMutation.mutate,
    isUpdatingAvailability: updateAvailabilityMutation.isPending,

    updateProfilePicture: updateProfilePictureMutation.mutate,
    isUpdatingPicture: updateProfilePictureMutation.isPending,

    updateAccountInfo: updateAccountInfoMutation.mutate,
    isUpdatingAccount: updateAccountInfoMutation.isPending,

    refetch: profileQuery.refetch,
  };
};
