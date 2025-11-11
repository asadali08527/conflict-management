import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePanelistCase } from '@/hooks/panelist/usePanelistCases';
import { usePanelistResolution } from '@/hooks/panelist/usePanelistResolution';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextareaWithSpeech } from '@/components/ui/textarea-with-speech';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  Download,
  Upload,
  StickyNote,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const PanelistCaseDetail = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [resolutionStatus, setResolutionStatus] = useState<'resolved' | 'no_outcome'>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'progress' | 'concern'>('progress');

  // Fetch case data
  const {
    case: caseData,
    parties,
    documents,
    timeline,
    isLoadingCase,
    isLoadingParties,
    isLoadingDocuments,
    isLoadingTimeline,
    addNote,
    isAddingNote,
  } = usePanelistCase(caseId || '');

  // Fetch resolution data
  const {
    myResolution,
    allResolutions,
    progress,
    isLoading: isLoadingResolution,
    submitResolution,
    isSubmitting,
    updateDraft,
    isUpdatingDraft,
  } = usePanelistResolution(caseId || '');

  // Load existing resolution if available
  useEffect(() => {
    if (myResolution) {
      setResolutionStatus(myResolution.resolutionStatus);
      setResolutionNotes(myResolution.resolutionNotes || '');
      setOutcome(myResolution.outcome || '');
      setRecommendations(myResolution.recommendations || '');
    }
  }, [myResolution]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleSubmitResolution = () => {
    if (!resolutionNotes || resolutionNotes.length < 50) {
      toast.error('Resolution notes must be at least 50 characters');
      return;
    }
    if (resolutionStatus === 'resolved' && !outcome) {
      toast.error('Outcome is required for resolved status');
      return;
    }

    submitResolution({
      resolutionStatus,
      resolutionNotes,
      outcome: resolutionStatus === 'resolved' ? outcome : undefined,
      recommendations: recommendations || undefined,
    });
  };

  const handleSaveDraft = () => {
    updateDraft({
      resolutionStatus,
      resolutionNotes,
      outcome: resolutionStatus === 'resolved' ? outcome : undefined,
      recommendations: recommendations || undefined,
    });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    addNote({
      content: noteContent,
      noteType,
    });
    setNoteContent('');
    setNoteType('progress');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
      assigned: { label: 'Assigned', className: 'bg-purple-100 text-purple-700' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-700' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: 'Low Priority', className: 'bg-gray-100 text-gray-600' },
      medium: { label: 'Medium Priority', className: 'bg-blue-100 text-blue-600' },
      high: { label: 'High Priority', className: 'bg-orange-100 text-orange-600' },
      urgent: { label: 'Urgent', className: 'bg-red-100 text-red-600' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      marriage: 'Marriage',
      land: 'Land',
      property: 'Property',
      family: 'Family',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  if (isLoadingCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PanelistNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <Skeleton className="h-10 w-32 mb-4" />
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PanelistNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Case not found</h3>
              <p className="text-gray-600 mb-4">The requested case could not be found.</p>
              <Button onClick={() => navigate('/panelist/cases')}>Back to Cases</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(caseData.status);
  const priorityBadge = getPriorityBadge(caseData.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PanelistNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/panelist/cases')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>

        {/* Case Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
                <p className="text-sm text-gray-600 mb-3">
                  Case ID: <span className="font-mono font-medium">{caseData.caseId}</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                  <Badge className={priorityBadge.className}>{priorityBadge.label}</Badge>
                  <Badge variant="outline">{getTypeLabel(caseData.type)}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/panelist/meetings/new')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{caseData.description}</p>
                </div>
                {caseData.conflictBackground && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Conflict Background</h3>
                    <p className="text-gray-600">{caseData.conflictBackground}</p>
                  </div>
                )}
                {caseData.desiredOutcomes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Desired Outcomes</h3>
                    <p className="text-gray-600">{caseData.desiredOutcomes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Section */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Submit Resolution</CardTitle>
                  {progress && (
                    <Badge variant="outline" className="bg-white">
                      {progress.submitted}/{progress.total} Panelists Submitted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {myResolution?.status === 'submitted' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Resolution Submitted</span>
                    </div>
                    <p className="text-sm text-gray-600">You have already submitted your resolution for this case.</p>
                  </div>
                ) : (
                  <>
                    <RadioGroup value={resolutionStatus} onValueChange={(v) => setResolutionStatus(v as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="resolved" id="resolved" />
                        <Label htmlFor="resolved">Resolved</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no_outcome" id="no_outcome" />
                        <Label htmlFor="no_outcome">No Outcome</Label>
                      </div>
                    </RadioGroup>

                    <div>
                      <Label htmlFor="notes">Resolution Notes *</Label>
                      <TextareaWithSpeech
                        id="notes"
                        placeholder="Provide detailed notes about the resolution..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={4}
                        className="mt-1"
                        disabled={isSubmitting || isUpdatingDraft}
                        mode="append"
                      />
                      <p className="text-xs text-gray-500 mt-1">{resolutionNotes.length} / 50 characters minimum. You can use the microphone button to speak your response.</p>
                    </div>

                    {resolutionStatus === 'resolved' && (
                      <div>
                        <Label htmlFor="outcome">Outcome *</Label>
                        <TextareaWithSpeech
                          id="outcome"
                          placeholder="Describe the specific outcome and terms..."
                          value={outcome}
                          onChange={(e) => setOutcome(e.target.value)}
                          rows={3}
                          className="mt-1"
                          disabled={isSubmitting || isUpdatingDraft}
                          mode="append"
                        />
                        <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="recommendations">Recommendations (Optional)</Label>
                      <TextareaWithSpeech
                        id="recommendations"
                        placeholder="Any follow-up actions or recommendations..."
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        rows={3}
                        className="mt-1"
                        disabled={isSubmitting || isUpdatingDraft}
                        mode="append"
                      />
                      <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isUpdatingDraft || isSubmitting}
                      >
                        {isUpdatingDraft && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Draft
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={handleSubmitResolution}
                        disabled={isSubmitting || isUpdatingDraft}
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Submit Resolution
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <Card>
              <CardHeader>
                <CardTitle>Parties Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingParties ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {parties.map((party, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-gray-900">
                          {party.firstName} {party.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Party {String.fromCharCode(65 + idx)}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-gray-600">Email: {party.email}</p>
                          <p className="text-gray-600">Phone: {party.phone}</p>
                        </div>
                      </div>
                    ))}
                    {parties.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No parties information available</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Case Documents</CardTitle>
                  <Button size="sm" onClick={() => toast.info('Document upload feature coming soon')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="h-8 w-8" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)} • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Case Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTimeline ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-5 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {timeline
                      .filter((activity) => activity.activityType === 'note_added')
                      .map((note) => (
                        <div key={note._id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <StickyNote className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900">
                                {note.performedBy?.firstName} {note.performedBy?.lastName}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(note.timestamp), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-700">{note.description}</p>
                        </div>
                      ))}
                    {timeline.filter((a) => a.activityType === 'note_added').length === 0 && (
                      <p className="text-center text-gray-500 py-4">No notes yet</p>
                    )}
                    <div className="pt-4 border-t">
                      <Label htmlFor="newNote">Add New Note</Label>
                      <TextareaWithSpeech
                        id="newNote"
                        placeholder="Write a note about this case..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={3}
                        className="mt-2"
                        mode="append"
                      />
                      <p className="text-xs text-gray-500 mt-1">You can use the microphone button to speak your response.</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Label htmlFor="noteType" className="text-sm">Type:</Label>
                        <select
                          id="noteType"
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value as any)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="general">General</option>
                          <option value="progress">Progress</option>
                          <option value="concern">Concern</option>
                        </select>
                      </div>
                      <Button
                        onClick={handleAddNote}
                        disabled={isAddingNote}
                        className="w-full mt-2"
                      >
                        {isAddingNote && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Note
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTimeline ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 w-0.5 bg-gray-200 min-h-[40px]"></div>
                        </div>
                        <div className="flex-1 pb-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((activity, idx) => (
                      <div key={activity._id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          {idx < timeline.length - 1 && (
                            <div className="flex-1 w-0.5 bg-gray-200 min-h-[40px]"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          {activity.performedBy && (
                            <p className="text-sm text-gray-600 mt-1">
                              by {activity.performedBy.firstName} {activity.performedBy.lastName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(activity.timestamp), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {timeline.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No timeline activities yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PanelistCaseDetail;
