import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePanelistDetails, usePanelistCases, useDeactivatePanelist, usePanelistPerformance } from '@/hooks/admin/useAdminPanelists';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  UserX,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  FileText,
  CheckCircle2,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { format } from 'date-fns';
import { AvailabilityStatus } from '@/types/panelist.types';

const PanelistDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch panelist details
  const { data: panelistData, isLoading, error } = usePanelistDetails(id || null);
  const panelist = panelistData?.data.panelist;
  const assignedCases = panelistData?.data.assignedCases || [];
  const totalCasesHandled = panelistData?.data.totalCasesHandled || 0;

  // Fetch cases
  const { data: casesData } = usePanelistCases(id || null, {
    page: currentPage,
    limit: 10,
  });

  // Fetch performance metrics
  const { data: performanceData, isLoading: performanceLoading } = usePanelistPerformance(id || null);
  const performance = performanceData?.data;

  // Deactivate mutation
  const deactivateMutation = useDeactivatePanelist();

  const cases = casesData?.data.cases || [];
  const pagination = casesData?.data.pagination;

  const getAvailabilityInfo = (status: AvailabilityStatus) => {
    const statusMap = {
      available: { label: 'Available', color: 'bg-green-100 text-green-700 border-green-200' },
      busy: { label: 'Busy', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      unavailable: { label: 'Unavailable', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return statusMap[status] || statusMap.available;
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await deactivateMutation.mutateAsync(id);
      navigate('/admin/panelists');
    } catch (error) {
      console.error('Failed to deactivate panelist:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminNavbar />
        <div className="flex items-center justify-center py-12 mt-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading panelist details...</span>
        </div>
      </div>
    );
  }

  if (error || !panelist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Failed to load panelist details</h3>
                  <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Panelist not found'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availabilityInfo = getAvailabilityInfo(panelist.availability.status);
  const workloadPercentage = Math.round(
    ((panelist.availability.currentCaseLoad || 0) / panelist.availability.maxCases) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavbar />

      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm mt-24">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/panelists')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Panelists
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/admin/panelists/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={panelist.availability.currentCaseLoad! > 0}>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Panelist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will deactivate {panelist.name} and they will no longer be available for case assignments.
                      This action can be reversed later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700">
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {panelist.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{panelist.name}</h2>
                  <p className="text-gray-600 mt-1">{panelist.occupation}</p>

                  {/* Status Badge */}
                  <Badge className={`${availabilityInfo.color} border mt-3`}>
                    {availabilityInfo.label}
                  </Badge>
                  {!panelist.isActive && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 mt-2">
                      Inactive
                    </Badge>
                  )}

                  {/* Rating */}
                  {panelist.rating && panelist.rating > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold text-gray-700">
                        {panelist.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${panelist.contactInfo.email}`} className="text-blue-600 hover:underline">
                      {panelist.contactInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{panelist.contactInfo.phone}</span>
                  </div>
                  {panelist.contactInfo.alternatePhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{panelist.contactInfo.alternatePhone}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                {panelist.address && (panelist.address.city || panelist.address.state) && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h3>
                      <p className="text-sm text-gray-700">
                        {panelist.address.street && <>{panelist.address.street}<br /></>}
                        {panelist.address.city && <>{panelist.address.city}, </>}
                        {panelist.address.state && <>{panelist.address.state} </>}
                        {panelist.address.zipCode}
                        {panelist.address.country && <><br />{panelist.address.country}</>}
                      </p>
                    </div>
                  </>
                )}

                {/* Languages */}
                {panelist.languages && panelist.languages.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {panelist.languages.map((lang) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Cases Handled</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCasesHandled}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-blue-600">{panelist.availability.currentCaseLoad || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Workload</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className={`${
                        workloadPercentage >= 90
                          ? 'bg-red-500'
                          : workloadPercentage >= 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      } h-2 rounded-full transition-all`}
                      style={{ width: `${workloadPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {panelist.availability.currentCaseLoad || 0} / {panelist.availability.maxCases} cases ({workloadPercentage}%)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography */}
            {panelist.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{panelist.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {!performanceLoading && performance && performance.statistics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Comprehensive performance analysis and case history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 mb-1">Total Cases</p>
                      <p className="text-2xl font-bold text-blue-900">{performance.statistics.totalCases}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs font-medium text-green-600 mb-1">Resolved</p>
                      <p className="text-2xl font-bold text-green-900">{performance.statistics.resolvedCases}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-900">{performance.statistics.successRate}%</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs font-medium text-orange-600 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Avg. Time
                      </p>
                      <p className="text-2xl font-bold text-orange-900">{performance.statistics.averageResolutionTime}d</p>
                    </div>
                  </div>

                  {/* Ratings Section */}
                  {performance.ratings && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Rating Overview
                          </h4>
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-2xl font-bold text-gray-900">
                              {performance.ratings.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({performance.ratings.totalRatings} ratings)
                            </span>
                          </div>
                        </div>

                        {/* Rating Distribution */}
                        {performance.ratings.ratingDistribution && (
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = performance.ratings.ratingDistribution[rating as keyof typeof performance.ratings.ratingDistribution] || 0;
                              const percentage = performance.ratings.totalRatings > 0
                                ? Math.round((count / performance.ratings.totalRatings) * 100)
                                : 0;
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-500 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Recent Cases */}
                  {performance.recentCases && performance.recentCases.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recent Cases
                        </h4>
                        <div className="space-y-2">
                          {performance.recentCases.slice(0, 5).map((caseItem) => (
                            <div key={caseItem.caseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{caseItem.title}</p>
                                <p className="text-xs text-gray-600">{caseItem.caseId}</p>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {caseItem.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Monthly Performance */}
                  {performance.monthlyPerformance && performance.monthlyPerformance.length > 0 && (
                    <>
                      <Separator />
                      <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Monthly Performance</h4>
                      <div className="space-y-3">
                        {performance.monthlyPerformance.slice(0, 6).map((month) => (
                          <div key={month.month} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{month.month}</span>
                              {month.averageRating !== undefined && month.averageRating !== null && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {month.averageRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Handled: </span>
                                <span className="font-medium text-gray-900">{month.casesHandled || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Resolved: </span>
                                <span className="font-medium text-green-600">{month.casesResolved || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{panelist.education.degree}</p>
                  <p className="text-gray-700">{panelist.education.institution}</p>
                  <p className="text-sm text-gray-600">Graduated: {panelist.education.yearCompleted}</p>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{panelist.experience.years} Years of Experience</p>
                  <p className="text-gray-700 leading-relaxed">{panelist.experience.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Areas of Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {panelist.specializations.map((spec) => (
                    <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-700 text-sm px-3 py-1">
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            {panelist.certifications && panelist.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {panelist.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-gray-700">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Assigned Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assigned Cases
                </CardTitle>
                <CardDescription>
                  {cases.length} active case{cases.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cases.length > 0 ? (
                  <div className="space-y-3">
                    {cases.map((caseItem) => (
                      <div
                        key={caseItem._id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/cases/${caseItem._id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{caseItem.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">Case ID: {caseItem.caseId}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{caseItem.type}</Badge>
                              <Badge variant="outline">{caseItem.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-gray-600">
                          Page {pagination.current} of {pagination.pages}
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
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No cases assigned yet</p>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium text-gray-900">{panelist.age} years</span>
                </div>
                {panelist.createdAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Added on:</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(panelist.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {panelist.updatedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(panelist.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelistDetail;
