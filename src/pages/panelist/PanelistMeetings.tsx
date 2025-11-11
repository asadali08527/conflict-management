import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelistMeetings } from '@/hooks/panelist/usePanelistMeetings';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, Phone, MapPin, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PanelistMeetings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Build query params based on filter
  const queryParams = filter === 'all' ? {} : filter === 'upcoming' ? { upcoming: true } : { past: true };

  // Use the hook to fetch meetings
  const { meetings, isLoading, error } = usePanelistMeetings(queryParams);

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-2">Manage your scheduled meetings and sessions</p>
          </div>
          <Button
            onClick={() => navigate('/panelist/meetings/new')}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Meetings
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => setFilter('past')}
          >
            Past
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading meetings</h3>
              <p className="text-gray-600">
                {(error as any)?.response?.data?.message || 'Failed to load meetings. Please try again.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Meetings List */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetings.map((meeting) => (
                <Card
                  key={meeting._id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/panelist/meetings/${meeting._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{meeting.title}</CardTitle>
                        {meeting.case && (
                          <p className="text-sm text-gray-600">{meeting.case.title}</p>
                        )}
                      </div>
                      <Badge className={getMeetingTypeColor(meeting.meetingType)}>
                        <span className="flex items-center gap-1">
                          {getMeetingTypeIcon(meeting.meetingType)}
                          {meeting.meetingType}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(meeting.scheduledDate), 'EEEE, MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {format(new Date(meeting.scheduledDate), 'h:mm a')} ({meeting.duration} min)
                    </div>
                    {meeting.meetingType === 'in-person' && meeting.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {meeting.location}
                      </div>
                    )}
                    {meeting.attendees && meeting.attendees.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-2">Attendees:</p>
                        <div className="flex flex-wrap gap-2">
                          {meeting.attendees.map((attendee, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {attendee.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {meeting.meetingType === 'video' && meeting.meetingLink && (
                      <Button
                        className="w-full mt-2"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(meeting.meetingLink, '_blank');
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {meetings.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
                  <p className="text-gray-600 mb-4">
                    Schedule your first meeting with case parties
                  </p>
                  <Button onClick={() => navigate('/panelist/meetings/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PanelistMeetings;
