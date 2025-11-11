import React, { useState, useEffect } from 'react';
import { usePanelistAuth } from '@/contexts/PanelistAuthContext';
import { usePanelistProfile } from '@/hooks/panelist/usePanelistProfile';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Briefcase, Award, Languages, Edit, Save, X, Star, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PanelistProfile = () => {
  const { panelistUser, panelistInfo } = usePanelistAuth();
  const {
    updateProfile,
    isUpdatingProfile,
    updateAvailability,
    isUpdatingAvailability,
    updateAccountInfo,
    isUpdatingAccount,
  } = usePanelistProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(panelistInfo?.bio || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(panelistInfo?.availability.status || 'available');
  const [maxCases, setMaxCases] = useState(panelistInfo?.availability.maxCases || 8);
  const [editedFirstName, setEditedFirstName] = useState(panelistUser?.firstName || '');
  const [editedLastName, setEditedLastName] = useState(panelistUser?.lastName || '');
  const [editedPhone, setEditedPhone] = useState(panelistUser?.phone || '');

  // Update local state when panelistInfo changes
  useEffect(() => {
    if (panelistInfo) {
      setEditedBio(panelistInfo.bio || '');
      setAvailabilityStatus(panelistInfo.availability.status);
      setMaxCases(panelistInfo.availability.maxCases);
    }
  }, [panelistInfo]);

  useEffect(() => {
    if (panelistUser) {
      setEditedFirstName(panelistUser.firstName || '');
      setEditedLastName(panelistUser.lastName || '');
      setEditedPhone(panelistUser.phone || '');
    }
  }, [panelistUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      bio: editedBio,
    });
  };

  const handleSaveAvailability = () => {
    updateAvailability({
      status: availabilityStatus,
      maxCases,
    });
  };

  const handleSaveAccountInfo = () => {
    if (!editedFirstName || !editedLastName) {
      toast.error('First name and last name are required');
      return;
    }
    updateAccountInfo({
      firstName: editedFirstName,
      lastName: editedLastName,
      phone: editedPhone,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PanelistNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={panelistInfo?.image?.url} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {panelistUser?.firstName?.[0]}
                      {panelistUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900">
                    {panelistUser?.firstName} {panelistUser?.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{panelistInfo?.occupation}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Cases</span>
                  <span className="text-lg font-bold text-gray-900">
                    {panelistInfo?.statistics?.totalCasesHandled || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="text-lg font-bold text-green-600">
                    {panelistInfo?.statistics?.casesResolved || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-lg font-bold text-blue-600">
                    {panelistInfo?.statistics?.totalCasesHandled
                      ? ((panelistInfo.statistics.casesResolved / panelistInfo.statistics.totalCasesHandled) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-gray-900">
                      {panelistInfo?.rating?.average.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({panelistInfo?.rating?.count || 0})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={availabilityStatus} onValueChange={(value) => setAvailabilityStatus(value as 'available' | 'busy' | 'unavailable')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge className={`${getStatusColor(availabilityStatus)} w-full justify-center py-2`}>
                  {availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1)}
                </Badge>
                <div>
                  <Label htmlFor="maxCases">Max Cases</Label>
                  <Input
                    id="maxCases"
                    type="number"
                    value={maxCases}
                    onChange={(e) => setMaxCases(parseInt(e.target.value))}
                    className="mt-1"
                    disabled={isUpdatingAvailability}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Current Load</span>
                    <span className="font-medium">
                      {panelistInfo?.availability.currentCaseLoad} / {maxCases}
                    </span>
                  </div>
                  <Progress
                    value={((panelistInfo?.availability.currentCaseLoad || 0) / maxCases) * 100}
                    className="h-2"
                  />
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleSaveAvailability}
                  disabled={isUpdatingAvailability}
                >
                  {isUpdatingAvailability && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Input id="email" value={panelistUser?.email} disabled className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                  </div>
                </div>
                {isEditing && (
                  <Button
                    className="w-full"
                    onClick={handleSaveAccountInfo}
                    disabled={isUpdatingAccount}
                  >
                    {isUpdatingAccount && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Occupation</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{panelistInfo?.occupation}</p>
                  </div>
                </div>
                <div>
                  <Label>Experience</Label>
                  <p className="text-gray-900 mt-1">{panelistInfo?.experience?.years} years</p>
                  <p className="text-sm text-gray-600 mt-1">{panelistInfo?.experience?.description}</p>
                </div>
                <div>
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {panelistInfo?.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Languages</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Languages className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {panelistInfo?.languages?.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={4}
                    className="mt-1"
                    disabled={isUpdatingProfile}
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile}
                  className="w-full"
                >
                  {isUpdatingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Update Bio
                </Button>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{panelistInfo?.education?.degree}</h3>
                    <p className="text-sm text-gray-600 mt-1">{panelistInfo?.education?.institution}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Graduated: {panelistInfo?.education?.yearCompleted}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="mt-1" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelistProfile;
