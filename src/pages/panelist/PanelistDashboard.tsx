import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelistAuth } from '@/contexts/PanelistAuthContext';
import { usePanelistDashboard } from '@/hooks/panelist/usePanelistDashboard';
import { usePanelistCases } from '@/hooks/panelist/usePanelistCases';
import { usePanelistMeetings } from '@/hooks/panelist/usePanelistMeetings';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format, isFuture } from 'date-fns';

const PanelistDashboard = () => {
  const navigate = useNavigate();
  const { panelistUser, panelistInfo } = usePanelistAuth();
  const {
    stats,
    isLoadingStats,
    activities,
    isLoadingActivity,
    upcomingMeetings,
    isLoadingMeetings,
    refetchAll: refetchDashboard,
  } = usePanelistDashboard();

  // Fetch actual cases to compute real stats as fallback
  const { cases, isLoading: isLoadingCases, refetch: refetchCases } = usePanelistCases({});
  const { meetings, isLoading: isLoadingAllMeetings, refetch: refetchMeetings } = usePanelistMeetings({ upcoming: true });

  // Compute real stats from actual data
  const computedStats = useMemo(() => {
    if (!cases) return null;

    const activeCases = cases.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
    const resolvedCases = cases.filter(c => c.status === 'resolved').length;
    const casesNeedingResolution = cases.filter(c =>
      (c.status === 'in_progress' || c.status === 'assigned') && !c.myResolution
    ).length;
    const upcomingMeetingsCount = meetings.filter(m =>
      isFuture(new Date(m.scheduledDate))
    ).length;

    return {
      activeCases,
      resolvedCases,
      casesNeedingResolution,
      upcomingMeetings: upcomingMeetingsCount,
      totalCases: cases.length,
      currentCaseLoad: activeCases,
      maxCases: panelistInfo?.availability?.maxCases || 10,
      capacityPercentage: panelistInfo?.availability?.maxCases
        ? (activeCases / panelistInfo.availability.maxCases) * 100
        : 0,
      unreadMessages: 0, // We'll skip messages as per user request
    };
  }, [cases, meetings, panelistInfo]);

  // Use computed stats if API stats are empty or zero
  const displayStats = useMemo(() => {
    const hasApiStats = stats && (stats.activeCases > 0 || stats.totalCases > 0);
    return hasApiStats ? stats : computedStats;
  }, [stats, computedStats]);

  const handleRefreshAll = () => {
    refetchDashboard();
    refetchCases();
    refetchMeetings();
  };

  const isLoading = isLoadingStats || isLoadingCases || isLoadingAllMeetings;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_assigned':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'meeting_scheduled':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'message_received':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'resolution_submitted':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'phone':
        return 'bg-green-100 text-green-700';
      case 'in-person':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PanelistNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {panelistUser?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's an overview of your cases and activities
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => navigate('/panelist/cases')}>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Cases</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{displayStats?.activeCases || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Total: {displayStats?.totalCases || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500" onClick={() => navigate('/panelist/cases?status=in_progress')}>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Needs Resolution</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{displayStats?.casesNeedingResolution || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending action</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500" onClick={() => navigate('/panelist/meetings')}>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{displayStats?.upcomingMeetings || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Scheduled</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500" onClick={() => navigate('/panelist/cases?status=resolved')}>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{displayStats?.resolvedCases || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Capacity Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Current Workload
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {displayStats?.currentCaseLoad || 0} of {displayStats?.maxCases || 0} cases assigned
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{(displayStats?.capacityPercentage || 0).toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">Capacity</p>
                  </div>
                </div>
                <Progress value={displayStats?.capacityPercentage || 0} className="h-3" />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    {(displayStats?.maxCases || 0) - (displayStats?.currentCaseLoad || 0)} slots available
                  </span>
                  {(displayStats?.capacityPercentage || 0) >= 80 ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Near Capacity
                    </Badge>
                  ) : (displayStats?.capacityPercentage || 0) >= 50 ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Moderate Load
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Case Overview */}
        {!isLoading && cases && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    My Active Cases
                  </CardTitle>
                  <CardDescription>Quick overview of your current assignments</CardDescription>
                </div>
                {cases.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/panelist/cases')}>
                    View All Cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Assigned Yet</h3>
                  <p className="text-gray-600 mb-4">You don't have any cases assigned at the moment.</p>
                  <p className="text-sm text-gray-500">Check back later for new assignments from the admin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.slice(0, 3).map((caseItem) => (
                    <div
                      key={caseItem._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/panelist/cases/${caseItem._id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{caseItem.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Case ID: {caseItem.caseId}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={
                            caseItem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            caseItem.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                            caseItem.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {caseItem.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={
                            caseItem.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            caseItem.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            caseItem.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {caseItem.priority}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                  {cases.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="link" onClick={() => navigate('/panelist/cases')}>
                        View {cases.length - 3} more cases
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest case updates and actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4 p-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => activity.caseId && navigate(`/panelist/cases/${activity.caseId}`)}
                        >
                          <div className="mt-0.5">{getActivityIcon(activity.activityType)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                    {activities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Meetings */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/panelist/meetings')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMeetings ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 rounded-lg border">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {upcomingMeetings.map((meeting) => (
                        <div
                          key={meeting._id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => navigate(`/panelist/meetings/${meeting._id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{meeting.title}</h4>
                            <Badge className={getMeetingTypeColor(meeting.meetingType)}>
                              {meeting.meetingType}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{meeting.caseTitle}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(meeting.scheduledDate), 'MMM dd, h:mm a')}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            {meeting.duration} minutes
                          </div>
                        </div>
                      ))}
                    </div>
                    {upcomingMeetings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No upcoming meetings</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => navigate('/panelist/meetings/new')}
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            {panelistInfo && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Your Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Cases</span>
                      <span className="text-lg font-bold text-gray-900">
                        {panelistInfo.statistics?.totalCasesHandled || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Resolved</span>
                      <span className="text-lg font-bold text-green-600">
                        {panelistInfo.statistics?.casesResolved || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-yellow-600">
                          {panelistInfo.rating?.average.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({panelistInfo.rating?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelistDashboard;
