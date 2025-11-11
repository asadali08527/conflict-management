import { useParams, useNavigate } from 'react-router-dom';
import ClientNavbar from '@/components/client/ClientNavbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  useClientCaseDetail,
  useClientCaseTimeline,
  useClientCaseDocuments,
  useClientCaseNotes,
  useClientCasePanel,
  useClientCaseResolution,
} from '@/hooks/client/useClientCases';
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Download,
  Star,
  Award,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import type { CaseStatus, CasePriority, CaseType } from '@/types/client/case.types';

const ClientCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const { data: caseDetail, isLoading: caseLoading, error: caseError } = useClientCaseDetail(caseId!);
  const { data: timeline, isLoading: timelineLoading } = useClientCaseTimeline(caseId!);
  const { data: documents, isLoading: documentsLoading } = useClientCaseDocuments(caseId!);
  const { data: notes, isLoading: notesLoading } = useClientCaseNotes(caseId!);
  const { data: panel, isLoading: panelLoading } = useClientCasePanel(caseId!);
  const { data: resolution, isLoading: resolutionLoading } = useClientCaseResolution(caseId!);

  if (!caseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ClientNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Case ID</h3>
            <Button onClick={() => navigate('/client/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (caseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ClientNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
            <p className="text-gray-600 mb-6">
              The case you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/client/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const getPriorityBadge = (priority: CasePriority) => {
    const config = {
      low: 'bg-gray-100 text-gray-700 border-gray-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200',
    };
    return config[priority] || 'bg-gray-100 text-gray-700';
  };

  const getCaseTypeBadge = (type: CaseType) => {
    const config = {
      marriage: { label: 'Marriage', icon: '💍' },
      land: { label: 'Land', icon: '🏞️' },
      property: { label: 'Property', icon: '🏠' },
      family: { label: 'Family', icon: '👨‍👩‍👧' },
    };
    return config[type] || { label: type, icon: '📄' };
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'case_created':
        return <FileText size={16} className="text-blue-500" />;
      case 'status_change':
        return <TrendingUp size={16} className="text-purple-500" />;
      case 'panelist_assigned':
      case 'panel_removed':
        return <Users size={16} className="text-green-500" />;
      case 'meeting_scheduled':
      case 'meeting_updated':
      case 'meeting_cancelled':
        return <Calendar size={16} className="text-orange-500" />;
      case 'resolution_submitted':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'note_added':
      case 'document_added':
        return <FileText size={16} className="text-gray-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/client/dashboard')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        {caseLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          </div>
        ) : caseDetail ? (
          <>
            {/* Case Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <Badge variant="outline" className="text-sm font-mono">
                        {caseDetail.caseId}
                      </Badge>
                      <Badge className={`${getStatusBadge(caseDetail.status).className} border`}>
                        {getStatusBadge(caseDetail.status).label}
                      </Badge>
                      <Badge className={`${getPriorityBadge(caseDetail.priority)} border`}>
                        {caseDetail.priority}
                      </Badge>
                      <span className="text-sm">
                        {getCaseTypeBadge(caseDetail.type).icon} {getCaseTypeBadge(caseDetail.type).label}
                      </span>
                    </div>
                    <CardTitle className="text-2xl mb-2">{caseDetail.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Submitted {format(new Date(caseDetail.createdAt), 'MMMM d, yyyy')}
                      </span>
                      {caseDetail.assignedPanelists && caseDetail.assignedPanelists.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {caseDetail.assignedPanelists.length} Panelist{caseDetail.assignedPanelists.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="panel">Panel</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="resolution">Resolution</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Case Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Case Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{caseDetail.description}</p>
                  </CardContent>
                </Card>

                {/* Parties Involved */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users size={20} />
                      Parties Involved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Party A (You) */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="text-blue-700" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {caseDetail.createdBy.firstName} {caseDetail.createdBy.lastName}
                              </span>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                You (Party A)
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{caseDetail.createdBy.email}</p>
                            {caseDetail.createdBy.phone && (
                              <p className="text-sm text-gray-600">{caseDetail.createdBy.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Other Parties */}
                      {caseDetail.parties && caseDetail.parties.length > 0 && (
                        caseDetail.parties.map((party, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="text-gray-700" size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{party.name}</span>
                                  <Badge variant="outline" className="text-xs">Party {String.fromCharCode(66 + index)}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{party.email}</p>
                                {party.phone && <p className="text-sm text-gray-600">{party.phone}</p>}
                                {party.relationshipToDispute && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Relationship: {party.relationshipToDispute}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Admin */}
                {caseDetail.assignedTo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User size={20} />
                        Assigned Administrator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {caseDetail.assignedTo.firstName[0]}{caseDetail.assignedTo.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {caseDetail.assignedTo.firstName} {caseDetail.assignedTo.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{caseDetail.assignedTo.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock size={20} />
                      Case Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {timelineLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : timeline && timeline.activities.length > 0 ? (
                      <div className="space-y-4">
                        {timeline.activities.map((activity, index) => (
                          <div key={activity._id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.activityType)}
                              </div>
                              {index < timeline.activities.length - 1 && (
                                <div className="flex-1 w-px bg-gray-200 my-2" style={{ minHeight: '20px' }} />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-1">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  {activity.performedBy?.userId && (
                                    <span>
                                      by {activity.performedBy.userId.firstName} {activity.performedBy.userId.lastName}
                                    </span>
                                  )}
                                  {activity.performedBy?.panelistId && (
                                    <span>
                                      by {activity.performedBy.panelistId.name}
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span>{format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No activity recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Panel Tab */}
              <TabsContent value="panel">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users size={20} />
                      Assigned Panel
                      {panel && panel.panelists.length > 0 && (
                        <Badge variant="secondary">{panel.panelists.length} Panelist{panel.panelists.length !== 1 ? 's' : ''}</Badge>
                      )}
                    </CardTitle>
                    {panel && panel.panelAssignedAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        Panel assigned on {format(new Date(panel.panelAssignedAt), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {panelLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <div className="flex gap-4">
                              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : panel && panel.panelists.length > 0 ? (
                      <div className="space-y-4">
                        {panel.panelists.map((panelMember) => (
                          <div
                            key={panelMember.panelist.id}
                            className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex gap-4">
                              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                {panelMember.panelist.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {panelMember.panelist.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{panelMember.panelist.occupation}</p>
                                  </div>
                                  {panelMember.panelist.rating && (
                                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                      <span className="font-semibold text-gray-900">
                                        {panelMember.panelist.rating.average.toFixed(1)}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        ({panelMember.panelist.rating.count})
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {panelMember.panelist.specializations && panelMember.panelist.specializations.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {panelMember.panelist.specializations.map((spec, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {panelMember.panelist.bio && (
                                  <p className="text-sm text-gray-700 mb-3">{panelMember.panelist.bio}</p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    Assigned {format(new Date(panelMember.assignedAt), 'MMM d, yyyy')}
                                  </div>
                                  {panelMember.assignedBy && (
                                    <>
                                      <span>•</span>
                                      <span>by {panelMember.assignedBy.name}</span>
                                    </>
                                  )}
                                  {panelMember.panelist.isActive && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        Active
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users size={48} className="mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Panel Assigned</h3>
                        <p className="text-sm">No panelists have been assigned to this case yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                {documentsLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3">
                            <Skeleton className="h-12 w-12 rounded flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : documents ? (
                  <>
                    {/* Case Documents Added by Admin/Panelist */}
                    {documents.caseDocuments && documents.caseDocuments.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText size={20} />
                            Case Documents
                            <Badge variant="secondary">{documents.caseDocuments.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {documents.caseDocuments.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                              >
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="flex-shrink-0"
                                >
                                  <Download size={16} className="mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Submission Files */}
                    {documents.submissionFiles && documents.submissionFiles.length > 0 && (
                      documents.submissionFiles.map((submission, subIndex) => (
                        <Card key={subIndex}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Users size={20} />
                              {submission.source}
                              <Badge variant="secondary">{submission.files.length}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {submission.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/50 transition-all"
                                >
                                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="text-green-600" size={24} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{file.fileName}</h4>
                                    {file.description && (
                                      <p className="text-xs text-gray-600 mt-1">{file.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                      <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                                      <span>•</span>
                                      <span>{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(file.uploadUrl, '_blank')}
                                    className="flex-shrink-0"
                                  >
                                    <Download size={16} className="mr-2" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}

                    {/* Empty State */}
                    {documents.totalDocuments === 0 && (
                      <Card>
                        <CardContent className="p-12">
                          <div className="text-center text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents</h3>
                            <p className="text-sm">No documents have been uploaded for this case yet.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : null}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare size={20} />
                      Case Notes
                      {notes && notes.notes.length > 0 && (
                        <Badge variant="secondary">{notes.notes.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex gap-3">
                              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-3 w-1/3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notes && notes.notes.length > 0 ? (
                      <div className="space-y-4">
                        {notes.notes.map((note) => (
                          <div key={note._id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {note.createdBy ? (
                                  `${note.createdBy.firstName[0]}${note.createdBy.lastName[0]}`
                                ) : note.panelistId ? (
                                  note.panelistId.name.split(' ').map(n => n[0]).join('')
                                ) : (
                                  '?'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {note.createdBy ? (
                                    <span className="font-semibold text-gray-900">
                                      {note.createdBy.firstName} {note.createdBy.lastName}
                                    </span>
                                  ) : note.panelistId ? (
                                    <span className="font-semibold text-gray-900">
                                      {note.panelistId.name}
                                    </span>
                                  ) : (
                                    <span className="font-semibold text-gray-900">Unknown</span>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      note.createdByType === 'admin'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    {note.createdByType === 'admin' ? 'Admin' : 'Panelist'}
                                  </Badge>
                                  {note.noteType !== 'general' && (
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {note.noteType}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap mb-2">{note.content}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Notes Yet</h3>
                        <p className="text-sm">No notes have been added to this case yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resolution Tab */}
              <TabsContent value="resolution" className="space-y-6">
                {resolutionLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ) : resolution ? (
                  <>
                    {/* Resolution Progress Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 size={20} />
                          Resolution Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <Badge
                              className={`${
                                resolution.resolutionStatus === 'not_started'
                                  ? 'bg-gray-100 text-gray-700'
                                  : resolution.resolutionStatus === 'in_progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : resolution.resolutionStatus === 'partial'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              } border capitalize`}
                            >
                              {resolution.resolutionStatus.replace('_', ' ')}
                            </Badge>
                          </div>

                          {resolution.resolutionProgress && (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-700">Submissions:</span>
                                  <span className="text-gray-900">
                                    {resolution.resolutionProgress.submitted} / {resolution.resolutionProgress.total}
                                  </span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                                    style={{
                                      width: `${
                                        (resolution.resolutionProgress.submitted /
                                          resolution.resolutionProgress.total) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {resolution.resolutionProgress.lastUpdated && (
                                <p className="text-xs text-gray-500">
                                  Last updated: {format(new Date(resolution.resolutionProgress.lastUpdated), 'MMM d, yyyy h:mm a')}
                                </p>
                              )}
                            </>
                          )}

                          {resolution.finalizedAt && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 size={16} />
                                <span className="text-sm font-medium">
                                  Case finalized on {format(new Date(resolution.finalizedAt), 'MMMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submitted Resolutions */}
                    {resolution.resolutions && resolution.resolutions.length > 0 ? (
                      resolution.resolutions.map((res, index) => (
                        <Card key={res.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {res.panelist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{res.panelist.name}</CardTitle>
                                  <p className="text-sm text-gray-600">{res.panelist.occupation}</p>
                                </div>
                              </div>
                              {res.panelist.rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {res.panelist.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {res.panelist.specializations && res.panelist.specializations.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {res.panelist.specializations.map((spec, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Award size={16} />
                                Recommendation
                              </h4>
                              <p className="text-gray-900 font-medium">{res.recommendation}</p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Reasoning</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{res.reasoning}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                              <Calendar size={12} />
                              Submitted on {format(new Date(res.submittedAt), 'MMMM d, yyyy h:mm a')}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-12">
                          <div className="text-center text-gray-500">
                            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {resolution.resolutionStatus === 'not_started'
                                ? 'Resolution Not Started'
                                : 'Waiting for Resolutions'}
                            </h3>
                            <p className="text-sm">
                              {resolution.resolutionStatus === 'not_started'
                                ? 'Panelists have not started working on resolutions yet.'
                                : 'Panelists are currently working on their resolutions.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : null}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ClientCaseDetail;
