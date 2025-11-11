import apiClient, { ApiResponse } from './api';
import {
  ProfileData,
  UpdateProfilePayload,
  UpdateAvailabilityPayload,
  UpdateProfilePicturePayload,
  UpdateAccountInfoPayload,
} from '@/types/panelist/profile.types';

export const profileService = {
  // Get profile
  getProfile: async (): Promise<ApiResponse<ProfileData>> => {
    const response = await apiClient.get<ApiResponse<ProfileData>>(
      '/api/panelist/profile'
    );
    return response.data;
  },

  // Update profile
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<ProfileData>> => {
    const response = await apiClient.patch<ApiResponse<ProfileData>>(
      '/api/panelist/profile',
      payload
    );
    return response.data;
  },

  // Update availability
  updateAvailability: async (
    payload: UpdateAvailabilityPayload
  ): Promise<ApiResponse<ProfileData>> => {
    const response = await apiClient.patch<ApiResponse<ProfileData>>(
      '/api/panelist/profile/availability',
      payload
    );
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (
    payload: UpdateProfilePicturePayload
  ): Promise<ApiResponse<ProfileData>> => {
    const response = await apiClient.patch<ApiResponse<ProfileData>>(
      '/api/panelist/profile/profile-picture',
      payload
    );
    return response.data;
  },

  // Update account info
  updateAccountInfo: async (
    payload: UpdateAccountInfoPayload
  ): Promise<ApiResponse<ProfileData>> => {
    const response = await apiClient.patch<ApiResponse<ProfileData>>(
      '/api/panelist/profile/account',
      payload
    );
    return response.data;
  },
};
