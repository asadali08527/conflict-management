import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseDetails, useUpdateCaseStatus, useAddCaseNote } from '@/hooks/admin/useAdminCases';
import { useScheduleMeeting } from '@/hooks/admin/useAdminMeetings';
import { useRemovePanelistFromCase } from '@/hooks/admin/useAdminPanelists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextareaWithSpeech } from '@/components/ui/textarea-with-speech';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  UserPlus,
  X,
} from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { format } from 'date-fns';
import { PanelAssignmentModal } from '@/components/admin/panelists/PanelAssignmentModal';

const statusOptions = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'assigned', label: 'Assigned', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const AdminCaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCaseDetails(id || null);
  const updateStatus = useUpdateCaseStatus();
  const addNote = useAddCaseNote();

  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('General');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showPanelAssignmentModal, setShowPanelAssignmentModal] = useState(false);

  const removePanelistMutation = useRemovePanelistFromCase();

  // Debug logging
  console.log('AdminCaseDetail Debug:', { id, isLoading, error, data });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    console.error('Error loading case:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-24">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load case</h3>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : 'An error occurred'}
                </p>
                <Button onClick={() => navigate('/admin/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Safely access nested data with fallbacks
  if (!data.data || !data.data.case) {
    console.error('Invalid data structure:', data);
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-24">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Invalid Response Data</h3>
                <p className="text-gray-600 mb-4">
                  The case data is not in the expected format. Please try refreshing the page.
                </p>
                <Button onClick={() => navigate('/admin/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const caseData = data.data.case;
  const partyA = data.data.partyA;
  const partyB = data.data.partyB;
  const hasPartyB = data.data.hasPartyBResponse;
  const meetings = data.data.meetings || [];

  const handleUpdateStatus = async () => {
    if (!id || !statusUpdate) return;

    await updateStatus.mutateAsync({
      caseId: id,
      payload: {
        status: statusUpdate,
        adminFeedback: adminFeedback || undefined,
        nextSteps: nextSteps || undefined,
      },
    });

    setShowStatusDialog(false);
    setStatusUpdate('');
    setAdminFeedback('');
    setNextSteps('');
  };

  const handleAddNote = async () => {
    if (!id || !noteContent.trim()) return;

    await addNote.mutateAsync({
      caseId: id,
      payload: {
        content: noteContent,
        noteType: noteType,
      },
    });

    setShowNoteDialog(false);
    setNoteContent('');
    setNoteType('General');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="pt-28 px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{caseData.title}</h1>
                <p className="text-gray-600 mt-1">Case ID: {caseData.caseId || caseData._id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[caseData.priority as keyof typeof priorityColors]}>
                  {caseData.priority.toUpperCase()}
                </Badge>
                <Badge className={statusOptions.find(s => s.value === caseData.status)?.color}>
                  {statusOptions.find(s => s.value === caseData.status)?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Case Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>New Status</Label>
                    <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Admin Feedback (Optional)</Label>
                    <TextareaWithSpeech
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      placeholder="Provide feedback about this status change..."
                      rows={3}
                      mode="append"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                  </div>
                  <div>
                    <Label>Next Steps (Optional)</Label>
                    <TextareaWithSpeech
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      placeholder="Outline next steps for this case..."
                      rows={3}
                      mode="append"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                  </div>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!statusUpdate || updateStatus.isPending}
                    className="w-full"
                  >
                    {updateStatus.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Case Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Note Type</Label>
                    <Select value={noteType} onValueChange={setNoteType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Observation">Observation</SelectItem>
                        <SelectItem value="Action Item">Action Item</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Note Content</Label>
                    <TextareaWithSpeech
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter your note here..."
                      rows={5}
                      mode="append"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                  </div>
                  <Button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || addNote.isPending}
                    className="w-full"
                  >
                    {addNote.isPending ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPanelAssignmentModal(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Panel
            </Button>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          {/* Assigned Panel Members */}
          {caseData.assignedPanelists && caseData.assignedPanelists.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Panel Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.assignedPanelists
                    .filter((assignment: any) => assignment.status === 'active')
                    .map((assignment: any) => {
                      const panelist = typeof assignment.panelist === 'object' ? assignment.panelist : null;
                      if (!panelist) return null;

                      return (
                        <div
                          key={assignment._id || panelist._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {panelist.name
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2) || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{panelist.name}</p>
                              <p className="text-sm text-gray-600">{panelist.occupation}</p>
                              {panelist.specializations && panelist.specializations.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {panelist.specializations.slice(0, 3).map((spec: string) => (
                                    <Badge key={spec} variant="outline" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Active
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (id && panelist._id) {
                                  await removePanelistMutation.mutateAsync({
                                    caseId: id,
                                    panelistId: panelist._id,
                                  });
                                }
                              }}
                              disabled={removePanelistMutation.isPending}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="comparison">Party Comparison</TabsTrigger>
              <TabsTrigger value="notes">Notes & Timeline</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Case Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-gray-500">Description</Label>
                      <p className="mt-1">{caseData.description}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Type</Label>
                      <p className="mt-1">{caseData.type}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Created By</Label>
                      <p className="mt-1">
                        {caseData.createdBy.firstName} {caseData.createdBy.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{caseData.createdBy.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Assigned To</Label>
                      <p className="mt-1">
                        {caseData.assignedTo
                          ? `${caseData.assignedTo.firstName} ${caseData.assignedTo.lastName}`
                          : 'Unassigned'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parties Involved</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseData.parties.map((party, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{party.role}</span>
                        </div>
                        <p className="text-sm">{party.name}</p>
                        <p className="text-sm text-gray-500">{party.contact}</p>
                      </div>
                    ))}
                    {hasPartyB && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Party B has submitted their response
                      </div>
                    )}
                    {!hasPartyB && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <Clock className="h-4 w-4" />
                        Waiting for Party B response
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              {!hasPartyB ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Waiting for Party B Submission
                    </h3>
                    <p className="text-gray-600">
                      Party comparison will be available once Party B submits their response.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Party A Column */}
                  <Card>
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-lg">Party A Submission</CardTitle>
                      <p className="text-sm text-gray-600">
                        Submitted: {partyA?.submittedAt ? format(new Date(partyA.submittedAt), 'PPp') : 'N/A'}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Conflict Type & Description</h4>
                            <p className="text-sm text-gray-700">
                              {partyA?.steps?.step1?.conflictType || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {partyA?.steps?.step1?.description || 'No description provided'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Conflict Background</h4>
                            <p className="text-sm text-gray-600">
                              {partyA?.steps?.step3?.conflictBackground || 'No background information provided'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Desired Outcomes</h4>
                            <p className="text-sm text-gray-600">
                              {partyA?.steps?.step4?.desiredOutcomes || 'No desired outcomes specified'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Scheduling Preferences</h4>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-gray-500">Preferred Days</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {partyA?.steps?.step5?.schedulingPreferences?.preferredDays?.map(
                                    (day, i) => (
                                      <Badge key={i} variant="outline">
                                        {day}
                                      </Badge>
                                    )
                                  ) || <span className="text-sm text-gray-500">No preferences specified</span>}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Preferred Times</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {partyA?.steps?.step5?.schedulingPreferences?.preferredTimes?.map(
                                    (time, i) => (
                                      <Badge key={i} variant="outline">
                                        {time}
                                      </Badge>
                                    )
                                  ) || <span className="text-sm text-gray-500">No preferences specified</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Documents</h4>
                            {partyA?.documents && partyA.documents.length > 0 ? (
                              <div className="space-y-2">
                                {partyA.documents.map((doc, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText className="h-4 w-4 flex-shrink-0" />
                                      <span className="text-sm truncate">
                                        {typeof doc === 'string' ? doc : doc.fileName}
                                      </span>
                                    </div>
                                    {typeof doc !== 'string' && doc.uploadUrl && (
                                      <a
                                        href={doc.uploadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No documents uploaded</p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Party B Column */}
                  <Card>
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-lg">Party B Submission</CardTitle>
                      <p className="text-sm text-gray-600">
                        Submitted: {partyB?.submittedAt ? format(new Date(partyB.submittedAt), 'PPp') : 'N/A'}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Conflict Type & Description</h4>
                            <p className="text-sm text-gray-700">
                              {partyB?.steps?.step1?.conflictType || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {partyB?.steps?.step1?.description || 'No description provided'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Conflict Background</h4>
                            <p className="text-sm text-gray-600">
                              {partyB?.steps?.step3?.conflictBackground || 'No background information provided'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Desired Outcomes</h4>
                            <p className="text-sm text-gray-600">
                              {partyB?.steps?.step4?.desiredOutcomes || 'No desired outcomes specified'}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Scheduling Preferences</h4>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-gray-500">Preferred Days</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {partyB?.steps?.step5?.schedulingPreferences?.preferredDays?.map(
                                    (day, i) => (
                                      <Badge key={i} variant="outline">
                                        {day}
                                      </Badge>
                                    )
                                  ) || <span className="text-sm text-gray-500">No preferences specified</span>}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Preferred Times</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {partyB?.steps?.step5?.schedulingPreferences?.preferredTimes?.map(
                                    (time, i) => (
                                      <Badge key={i} variant="outline">
                                        {time}
                                      </Badge>
                                    )
                                  ) || <span className="text-sm text-gray-500">No preferences specified</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Documents</h4>
                            {partyB?.documents && partyB.documents.length > 0 ? (
                              <div className="space-y-2">
                                {partyB.documents.map((doc, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText className="h-4 w-4 flex-shrink-0" />
                                      <span className="text-sm truncate">
                                        {typeof doc === 'string' ? doc : doc.fileName}
                                      </span>
                                    </div>
                                    {typeof doc !== 'string' && doc.uploadUrl && (
                                      <a
                                        href={doc.uploadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No documents uploaded</p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseData.notes && caseData.notes.length > 0 ? (
                    <div className="space-y-3">
                      {caseData.notes.map((note, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium">Admin</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(note.createdAt), 'PPp')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No notes yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scheduled Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  {meetings && meetings.length > 0 ? (
                    <div className="space-y-3">
                      {meetings.map((meeting) => (
                        <div key={meeting._id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{meeting.title}</h4>
                              <p className="text-sm text-gray-600">{meeting.description}</p>
                            </div>
                            <Badge>{meeting.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(meeting.scheduledDate), 'PPp')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {meeting.duration} minutes
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {meeting.meetingType}
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label className="text-xs text-gray-500">Attendees</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {meeting.attendees.map((attendee, i) => (
                                <Badge key={i} variant="outline">
                                  {attendee.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No meetings scheduled</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Case Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {partyA?.documents && partyA.documents.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Party A Documents</h4>
                        <div className="space-y-2">
                          {partyA.documents.map((doc, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {typeof doc === 'string' ? doc : doc.fileName}
                                  </p>
                                  {typeof doc !== 'string' && (
                                    <p className="text-xs text-gray-500">
                                      {(doc.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                              {typeof doc !== 'string' && doc.uploadUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={doc.uploadUrl} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {partyB?.documents && partyB.documents.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Party B Documents</h4>
                        <div className="space-y-2">
                          {partyB.documents.map((doc, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {typeof doc === 'string' ? doc : doc.fileName}
                                  </p>
                                  {typeof doc !== 'string' && (
                                    <p className="text-xs text-gray-500">
                                      {(doc.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                              {typeof doc !== 'string' && doc.uploadUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={doc.uploadUrl} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!partyA?.documents || partyA.documents.length === 0) &&
                      (!partyB?.documents || partyB.documents.length === 0) && (
                        <p className="text-center text-gray-500 py-8">No documents uploaded</p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Panel Assignment Modal */}
      {id && (
        <PanelAssignmentModal
          open={showPanelAssignmentModal}
          onOpenChange={setShowPanelAssignmentModal}
          caseId={id}
          caseType={caseData.type}
          onSuccess={() => {
            // Refresh case details after successful assignment
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default AdminCaseDetail;
