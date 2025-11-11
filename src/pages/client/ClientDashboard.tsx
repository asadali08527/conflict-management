import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '@/components/client/ClientNavbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useClientDashboardStats,
  useClientRecentUpdates,
  useClientUpcomingMeetings,
} from '@/hooks/client/useClientDashboard';
import { useClientCases } from '@/hooks/client/useClientCases';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  PlusCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import type { CaseStatus, CasePriority, CaseType } from '@/types/client/case.types';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading } = useClientDashboardStats();
  const { data: recentUpdates, isLoading: updatesLoading } = useClientRecentUpdates(5);
  const { data: upcomingMeetings, isLoading: meetingsLoading } = useClientUpcomingMeetings(3);
  const { data: casesData, isLoading: casesLoading } = useClientCases({ limit: 100 });

  const stats = statsData?.overview;
  const cases = casesData?.cases || [];

  // Status badge configuration
  const getStatusBadge = (status: CaseStatus) => {
    const config = {
      open: { label: 'Open', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      assigned: { label: 'Assigned', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      panel_assigned: { label: 'Panel Assigned', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-200' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    return config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  // Priority badge configuration
  const getPriorityBadge = (priority: CasePriority) => {
    const config = {
      low: 'bg-gray-100 text-gray-700 border-gray-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200',
    };
    return config[priority] || 'bg-gray-100 text-gray-700';
  };

  // Case type badge
  const getCaseTypeBadge = (type: CaseType) => {
    const config = {
      marriage: { label: 'Marriage', icon: '💍' },
      land: { label: 'Land', icon: '🏞️' },
      property: { label: 'Property', icon: '🏠' },
      family: { label: 'Family', icon: '👨‍👩‍👧' },
    };
    return config[type] || { label: type, icon: '📄' };
  };

  // Activity type icon
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'case_created':
        return <FileText size={16} className="text-blue-500" />;
      case 'status_change':
        return <TrendingUp size={16} className="text-purple-500" />;
      case 'panelist_assigned':
        return <Users size={16} className="text-green-500" />;
      case 'meeting_scheduled':
        return <Calendar size={16} className="text-orange-500" />;
      case 'resolution_submitted':
        return <CheckCircle2 size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your cases and stay updated on their progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/client/cases')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats?.totalCases || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total Cases</div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {stats?.openCases || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Open Cases</div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <LayoutDashboard className="text-purple-600" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {stats?.inProgressCases || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">In Progress</div>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="text-yellow-600" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats?.resolvedCases || 0}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Resolved</div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-green-600" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Updates */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updatesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentUpdates && recentUpdates.activities.length > 0 ? (
                <div className="space-y-4">
                  {recentUpdates.activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => navigate(`/client/cases/${activity.case._id}`)}
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.case.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {activity.case.caseId}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No recent updates</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : upcomingMeetings && upcomingMeetings.meetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.meetings.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => navigate(`/client/cases/${meeting.case._id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {meeting.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${
                            meeting.meetingType === 'video'
                              ? 'bg-blue-50 text-blue-700'
                              : meeting.meetingType === 'phone'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {meeting.meetingType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{meeting.case.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {format(new Date(meeting.scheduledDate), 'MMM d, yyyy')}
                        <span className="mx-1">•</span>
                        {meeting.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No upcoming meetings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Cases Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                My Cases
              </CardTitle>
              <Button
                onClick={() => navigate('/submit-case')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <PlusCircle size={16} className="mr-2" />
                Submit New Case
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : cases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cases.slice(0, 6).map((caseItem) => {
                  const statusBadge = getStatusBadge(caseItem.status);
                  const caseTypeBadge = getCaseTypeBadge(caseItem.type);

                  return (
                    <Card
                      key={caseItem._id}
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                      onClick={() => navigate(`/client/cases/${caseItem._id}`)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                            {caseItem.title}
                          </h3>
                          <Badge className={`${getPriorityBadge(caseItem.priority)} border text-xs flex-shrink-0`}>
                            {caseItem.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {caseItem.caseId}
                          </Badge>
                          <Badge className={`${statusBadge.className} border text-xs`}>
                            {statusBadge.label}
                          </Badge>
                          <span className="text-xs">
                            {caseTypeBadge.icon} {caseTypeBadge.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {caseItem.description}
                        </p>

                        {caseItem.assignedPanelists && caseItem.assignedPanelists.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users size={14} />
                            <span>
                              {caseItem.activePanelistsCount} panelist{caseItem.activePanelistsCount !== 1 ? 's' : ''} assigned
                            </span>
                          </div>
                        )}

                        {caseItem.resolutionProgress && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <TrendingUp size={14} />
                            <span>
                              Resolution: {caseItem.resolutionProgress.submitted} / {caseItem.resolutionProgress.total}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          Submitted {format(new Date(caseItem.createdAt), 'MMM d, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any cases for mediation yet.
                </p>
                <Button
                  onClick={() => navigate('/submit-case')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Submit Your First Case
                </Button>
              </div>
            )}

            {cases.length > 6 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => navigate('/client/cases')}>
                  View All Cases ({cases.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
