import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPanelists, usePanelistStatistics } from '@/hooks/admin/useAdminPanelists';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Award,
  Languages,
  MoreVertical,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { Panelist, AvailabilityStatus, SpecializationType } from '@/types/panelist.types';
import { CreateAccountModal } from '@/components/admin/panelists/CreateAccountModal';
import { ResetPasswordModal } from '@/components/admin/panelists/ResetPasswordModal';

const PanelistList = () => {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [createAccountModal, setCreateAccountModal] = useState<{
    open: boolean;
    panelistId: string;
    panelistName: string;
  }>({ open: false, panelistId: '', panelistName: '' });

  const [resetPasswordModal, setResetPasswordModal] = useState<{
    open: boolean;
    panelistId: string;
    panelistName: string;
  }>({ open: false, panelistId: '', panelistName: '' });

  // Fetch panelists
  const { data, isLoading, error } = useAdminPanelists({
    page: currentPage,
    limit: 20,
    specialization: specializationFilter !== 'all' ? (specializationFilter as SpecializationType) : undefined,
    availability: availabilityFilter !== 'all' ? (availabilityFilter as AvailabilityStatus) : undefined,
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = usePanelistStatistics();

  const panelists = data?.data.panelists || [];
  const pagination = data?.data.pagination;
  const stats = statsData?.data;

  const getAvailabilityInfo = (status: AvailabilityStatus) => {
    const statusMap = {
      available: { label: 'Available', color: 'bg-green-100 text-green-700 border-green-200', icon: UserCheck },
      busy: { label: 'Busy', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Briefcase },
      unavailable: { label: 'Unavailable', color: 'bg-red-100 text-red-700 border-red-200', icon: UserX },
    };
    return statusMap[status] || statusMap.available;
  };

  const getWorkloadPercentage = (currentLoad: number, maxCases: number) => {
    return Math.round((currentLoad / maxCases) * 100);
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavbar />

      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm mt-24">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Members</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage mediators, arbitrators, and panel members
              </p>
            </div>
            <Button onClick={() => navigate('/admin/panelists/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Panelist
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Panelists</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overview.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.overview.available}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Busy</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.overview.busy}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Cases</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {stats.overview.totalActiveAssignments}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, occupation, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="marriage">Marriage</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="divorce">Divorce</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="neighbor">Neighbor</SelectItem>
                  <SelectItem value="inheritance">Inheritance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading panelists...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Failed to load panelists</h3>
                  <p className="text-sm mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panelists List */}
        {!isLoading && !error && (
          <>
            <div className="space-y-4">
              {panelists.map((panelist) => {
                const availabilityInfo = getAvailabilityInfo(panelist.availability.status);
                const AvailabilityIcon = availabilityInfo.icon;
                const workloadPercentage = getWorkloadPercentage(
                  panelist.availability.currentCaseLoad || 0,
                  panelist.availability.maxCases
                );

                return (
                  <Card
                    key={panelist._id}
                    className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
                    onClick={() => navigate(`/admin/panelists/${panelist._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start gap-4 mb-3">
                            {/* Avatar */}
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl font-bold">
                              {panelist.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">{panelist.name}</h3>
                                {panelist.rating && panelist.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {panelist.rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{panelist.occupation}</p>

                              {/* Contact Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{panelist.contactInfo.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{panelist.contactInfo.phone}</span>
                                </div>
                              </div>

                              {/* Bio Preview */}
                              {panelist.bio && (
                                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{panelist.bio}</p>
                              )}

                              {/* Specializations */}
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                {panelist.specializations.slice(0, 5).map((spec) => (
                                  <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-700">
                                    {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                  </Badge>
                                ))}
                                {panelist.specializations.length > 5 && (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                    +{panelist.specializations.length - 5} more
                                  </Badge>
                                )}
                              </div>

                              {/* Info Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                                {/* Experience */}
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">Experience</p>
                                  <p className="text-sm text-gray-900">{panelist.experience.years} years</p>
                                </div>

                                {/* Education */}
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">Education</p>
                                  <p className="text-sm text-gray-900">{panelist.education.degree}</p>
                                  <p className="text-xs text-gray-600">{panelist.education.institution}</p>
                                </div>

                                {/* Languages */}
                                {panelist.languages && panelist.languages.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                      <Languages className="h-3 w-3" />
                                      Languages
                                    </p>
                                    <p className="text-sm text-gray-900">{panelist.languages.join(', ')}</p>
                                  </div>
                                )}

                                {/* Certifications */}
                                {panelist.certifications && panelist.certifications.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      Certifications
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      {panelist.certifications.length} certification(s)
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Workload Bar */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Case Load</span>
                                  <span>
                                    {panelist.availability.currentCaseLoad || 0} / {panelist.availability.maxCases}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`${getWorkloadColor(workloadPercentage)} h-2 rounded-full transition-all`}
                                    style={{ width: `${workloadPercentage}%` }}
                                  />
                                </div>
                              </div>

                              {/* Status Badges */}
                              <div className="flex items-center gap-2 mt-4 flex-wrap">
                                <Badge className={`${availabilityInfo.color} border`}>
                                  <AvailabilityIcon className="h-3 w-3 mr-1" />
                                  {availabilityInfo.label}
                                </Badge>
                                {!panelist.isActive && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/panelists/${panelist._id}`);
                            }}
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreateAccountModal({
                                    open: true,
                                    panelistId: panelist._id,
                                    panelistName: panelist.name,
                                  });
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Account
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResetPasswordModal({
                                    open: true,
                                    panelistId: panelist._id,
                                    panelistName: panelist.name,
                                  });
                                }}
                              >
                                <KeyRound className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing page {pagination.current} of {pagination.pages} ({pagination.total} total panelists)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && panelists.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No panelists found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || specializationFilter !== 'all' || availabilityFilter !== 'all'
                      ? 'Try adjusting your filters or search term'
                      : 'Get started by adding your first panelist'}
                  </p>
                  <Button onClick={() => navigate('/admin/panelists/new')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Panelist
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateAccountModal
        open={createAccountModal.open}
        onOpenChange={(open) =>
          setCreateAccountModal({ ...createAccountModal, open })
        }
        panelistId={createAccountModal.panelistId}
        panelistName={createAccountModal.panelistName}
        onSuccess={() => {
          // Optionally refetch data
        }}
      />

      <ResetPasswordModal
        open={resetPasswordModal.open}
        onOpenChange={(open) =>
          setResetPasswordModal({ ...resetPasswordModal, open })
        }
        panelistId={resetPasswordModal.panelistId}
        panelistName={resetPasswordModal.panelistName}
        onSuccess={() => {
          // Optionally refetch data
        }}
      />
    </div>
  );
};

export default PanelistList;
