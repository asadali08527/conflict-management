import { useParams, useNavigate } from 'react-router-dom';
import ClientNavbar from '@/components/client/ClientNavbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useClientMeetingDetail } from '@/hooks/client/useClientMeetings';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Users,
  User,
  FileText,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import type { MeetingType, MeetingStatus } from '@/types/client/meeting.types';

const ClientMeetingDetail = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const { data: meetingData, isLoading, error } = useClientMeetingDetail(meetingId!);
  const meeting = meetingData?.meeting;

  if (!meetingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ClientNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Meeting ID</h3>
            <Button onClick={() => navigate('/client/meetings')}>
              Back to Meetings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ClientNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Meeting Not Found</h3>
            <p className="text-gray-600 mb-6">
              The meeting you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/client/meetings')}>
              Back to Meetings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get meeting type details
  const getMeetingTypeDetails = (type: MeetingType) => {
    const config = {
      video: {
        label: 'Video Call',
        icon: Video,
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        description: 'Join via video conferencing',
      },
      phone: {
        label: 'Phone Call',
        icon: Phone,
        className: 'bg-green-100 text-green-700 border-green-200',
        description: 'Join via phone',
      },
      in_person: {
        label: 'In-Person Meeting',
        icon: MapPin,
        className: 'bg-purple-100 text-purple-700 border-purple-200',
        description: 'Meet at the specified location',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientNavbar />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/client/meetings')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Meetings
        </Button>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ) : meeting ? (
          <>
            {/* Meeting Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <Badge className={`${getStatusBadge(meeting.status).className} border`}>
                        {getStatusBadge(meeting.status).label}
                      </Badge>
                      {(() => {
                        const typeDetails = getMeetingTypeDetails(meeting.meetingType);
                        const TypeIcon = typeDetails.icon;
                        return (
                          <Badge className={`${typeDetails.className} border flex items-center gap-1`}>
                            <TypeIcon size={12} />
                            {typeDetails.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <CardTitle className="text-2xl mb-2">{meeting.title}</CardTitle>
                    {meeting.description && (
                      <p className="text-gray-600">{meeting.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Date & Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar size={20} />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Calendar className="text-blue-600" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(meeting.scheduledDate), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(meeting.scheduledDate), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Clock className="text-purple-600" size={20} />
                        <p className="text-gray-700">Duration: {meeting.duration} minutes</p>
                      </div>
                      {isFuture(new Date(meeting.scheduledDate)) && meeting.status === 'scheduled' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            This meeting is scheduled for the future.
                          </p>
                        </div>
                      )}
                      {isPast(new Date(meeting.scheduledDate)) && meeting.status === 'scheduled' && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            This meeting time has passed.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Meeting Link/Location */}
                {meeting.meetingType === 'video' && meeting.meetingLink && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Video size={20} />
                        Join Video Call
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => window.open(meeting.meetingLink, '_blank')}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        <Video size={16} className="mr-2" />
                        Join Meeting
                        <ExternalLink size={14} className="ml-2" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Click to open in a new window
                      </p>
                    </CardContent>
                  </Card>
                )}

                {meeting.meetingType === 'in_person' && meeting.location && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin size={20} />
                        Meeting Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900">{meeting.location}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Related Case */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText size={20} />
                      Related Case
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/client/cases/${meeting.case._id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{meeting.case.title}</h4>
                          <Badge variant="outline" className="text-xs">{meeting.case.caseId}</Badge>
                          {meeting.case.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{meeting.case.description}</p>
                          )}
                        </div>
                        <ArrowLeft size={16} className="text-gray-400 rotate-180 flex-shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {meeting.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Scheduled By */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User size={20} />
                      Scheduled By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {meeting.scheduledBy.firstName[0]}{meeting.scheduledBy.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {meeting.scheduledBy.firstName} {meeting.scheduledBy.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{meeting.scheduledBy.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendees */}
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users size={20} />
                        Attendees
                        <Badge variant="secondary">{meeting.attendees.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {meeting.attendees.map((attendee, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0">
                              {attendee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attendee.name}
                                {attendee.isParty && (
                                  <Badge variant="outline" className="ml-2 text-xs">Party</Badge>
                                )}
                              </p>
                              <p className="text-xs text-gray-600 truncate">{attendee.email}</p>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${
                                  attendee.status === 'accepted'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : attendee.status === 'declined'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {attendee.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ClientMeetingDetail;
