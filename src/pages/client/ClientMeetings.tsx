import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '@/components/client/ClientNavbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientMeetings } from '@/hooks/client/useClientMeetings';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Users,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import type { MeetingStatus, MeetingType } from '@/types/client/meeting.types';

const ClientMeetings = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<MeetingStatus | 'all'>('all');

  // Fetch meetings based on selected status
  const { data: meetingsData, isLoading } = useClientMeetings({
    limit: 100,
    ...(selectedStatus !== 'all' && { status: selectedStatus }),
  });

  const meetings = meetingsData?.meetings || [];

  // Get meeting type badge
  const getMeetingTypeBadge = (type: MeetingType) => {
    const config = {
      video: {
        label: 'Video',
        icon: Video,
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      phone: {
        label: 'Phone',
        icon: Phone,
        className: 'bg-green-100 text-green-700 border-green-200',
      },
      in_person: {
        label: 'In Person',
        icon: MapPin,
        className: 'bg-purple-100 text-purple-700 border-purple-200',
      },
    };
    return config[type] || config.video;
  };

  // Get status badge
  const getStatusBadge = (status: MeetingStatus) => {
    const config = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
    };
    return config[status] || config.scheduled;
  };

  // Filter meetings by upcoming/past
  const now = new Date();
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.scheduledDate) >= now && m.status === 'scheduled'
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.scheduledDate) < now || m.status !== 'scheduled'
  );

  const MeetingCard = ({ meeting }: { meeting: typeof meetings[0] }) => {
    const typeBadge = getMeetingTypeBadge(meeting.meetingType);
    const statusBadge = getStatusBadge(meeting.status);
    const TypeIcon = typeBadge.icon;
    const isUpcoming = new Date(meeting.scheduledDate) >= now && meeting.status === 'scheduled';

    return (
      <Card
        className="hover:shadow-lg transition-all cursor-pointer border-l-4"
        style={{
          borderLeftColor: isUpcoming ? '#3b82f6' : '#9ca3af',
        }}
        onClick={() => navigate(`/client/meetings/${meeting._id}`)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {meeting.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">{meeting.case.title}</p>
            </div>
            <Badge variant="outline" className="flex-shrink-0">
              {meeting.case.caseId}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={16} />
                <span className="font-medium">
                  {format(new Date(meeting.scheduledDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} />
                <span>{format(new Date(meeting.scheduledDate), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>•</span>
                <span>{meeting.duration} min</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${typeBadge.className} border flex items-center gap-1`}>
                <TypeIcon size={12} />
                {typeBadge.label}
              </Badge>
              <Badge className={`${statusBadge.className} border`}>
                {statusBadge.label}
              </Badge>
            </div>

            {meeting.scheduledBy && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} />
                <span>
                  Scheduled by {meeting.scheduledBy.firstName} {meeting.scheduledBy.lastName}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {meeting.case.type && <span className="capitalize">{meeting.case.type} case</span>}
              </span>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View Details
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">
            View and manage your scheduled meetings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {upcomingMeetings.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Upcoming</div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {pastMeetings.filter((m) => m.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-600">
                    {meetings.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total</div>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="text-gray-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : meetings.length > 0 ? (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingMeetings.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastMeetings.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All ({meetings.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                  {upcomingMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingMeetings.map((meeting) => (
                        <MeetingCard key={meeting._id} meeting={meeting} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Meetings</h3>
                      <p className="text-sm">You don't have any scheduled meetings.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                  {pastMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastMeetings.map((meeting) => (
                        <MeetingCard key={meeting._id} meeting={meeting} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Past Meetings</h3>
                      <p className="text-sm">You don't have any past meetings yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meetings.map((meeting) => (
                      <MeetingCard key={meeting._id} meeting={meeting} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meetings Yet</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any meetings scheduled yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientMeetings;
