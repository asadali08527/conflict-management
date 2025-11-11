import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCases } from '@/hooks/admin/useAdminCases';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminCasesService } from '@/services/admin/adminCases';
import { DashboardStats } from '@/types/admin.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  ChevronRight,
  LogOut,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { format } from 'date-fns';
import { CaseListItem } from '@/types/admin.types';

// Dummy case for testing UI when no cases exist
const DUMMY_CASE: CaseListItem = {
  _id: 'DEMO-001',
  caseId: 'CASE-DEMO-001',
  title: 'Sample Property Dispute',
  description: 'This is a demo case to showcase the admin interface. Real cases will appear here once submitted.',
  type: 'Property',
  status: 'open',
  priority: 'medium',
  createdBy: {
    _id: 'demo-user',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
  },
  assignedTo: null,
  parties: [
    {
      name: 'Party A Example',
      contact: 'partya@example.com',
      role: 'Party A',
    },
    {
      name: 'Party B Example',
      contact: 'partyb@example.com',
      role: 'Party B',
    },
  ],
  hasPartyBResponse: false,
  sessionId: 'demo-session-123',
  createdAt: new Date().toISOString(),
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await adminCasesService.getDashboardStats();
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch cases from API
  const { data, isLoading, error } = useAdminCases({
    page: currentPage,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const cases = data?.data.cases || [];
  const pagination = data?.data.pagination;

  // Use dummy case if no real cases exist
  const displayCases = cases.length > 0 ? cases : [DUMMY_CASE];
  const isDemoMode = cases.length === 0;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      open: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
      assigned: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: User },
      in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle2 },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.open;
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-600' },
      urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  // Use stats from API or fallback to calculated stats
  const stats = dashboardStats ? {
    total: dashboardStats.cases.total,
    new: dashboardStats.cases.open,
    assigned: dashboardStats.cases.assigned,
    inProgress: dashboardStats.cases.resolved,
    waitingForPartyB: cases.filter(c => !c.hasPartyBResponse && c.status !== 'closed').length,
  } : {
    total: cases.length,
    new: cases.filter(c => c.status === 'open').length,
    assigned: cases.filter(c => c.status === 'assigned').length,
    inProgress: cases.filter(c => c.status === 'in_progress').length,
    waitingForPartyB: cases.filter(c => !c.hasPartyBResponse && c.status !== 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavbar />

      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm mt-24">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {adminUser?.firstName} {adminUser?.lastName}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  No cases found. Showing a demo case to help you understand the interface. Real cases will appear here once submitted by users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Cases</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.new}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.assigned}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Awaiting Party B</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.waitingForPartyB}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access - Panel Management */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Panel Management</h3>
                <p className="text-sm text-gray-600">Manage mediators, arbitrators, and assign panels to cases</p>
              </div>
              <Button onClick={() => navigate('/admin/panelists')} className="gap-2">
                <Users className="h-4 w-4" />
                View Panelists
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  placeholder="Search cases, parties, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading cases...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Failed to load cases</h3>
                  <p className="text-sm mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cases List */}
        {!isLoading && !error && (
          <>
            <div className="space-y-4">
              {displayCases.map((caseItem) => {
                const statusInfo = getStatusInfo(caseItem.status);
                const priorityInfo = getPriorityInfo(caseItem.priority);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={caseItem._id}
                    className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
                    onClick={() => navigate(`/admin/cases/${caseItem._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <StatusIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {caseItem.title}
                                </h3>
                                {isDemoMode && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                    Demo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Case ID: <span className="font-mono font-medium">{caseItem.caseId || caseItem._id}</span>
                              </p>
                              <p className="text-sm text-gray-700 line-clamp-2">{caseItem.description}</p>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            {/* Parties */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Parties Involved
                              </p>
                              <div className="space-y-1">
                                {caseItem.parties.map((party, idx) => (
                                  <p key={idx} className="text-sm text-gray-900">
                                    {party.name}
                                  </p>
                                ))}
                              </div>
                            </div>

                            {/* Case Type */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Type
                              </p>
                              <p className="text-sm text-gray-900">{caseItem.type}</p>
                            </div>

                            {/* Created By */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Submitted By
                              </p>
                              <p className="text-sm text-gray-900">
                                {caseItem.createdBy.firstName} {caseItem.createdBy.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{caseItem.createdBy.email}</p>
                            </div>

                            {/* Date */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Submitted On
                              </p>
                              <p className="text-sm text-gray-900">
                                {caseItem.createdAt
                                  ? format(new Date(caseItem.createdAt), 'MMM dd, yyyy')
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Badges Row */}
                          <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <Badge className={`${statusInfo.color} border`}>
                              {statusInfo.label}
                            </Badge>
                            <Badge className={`${priorityInfo.color}`}>
                              {priorityInfo.label} Priority
                            </Badge>
                            {caseItem.hasPartyBResponse ? (
                              <Badge className="bg-green-100 text-green-700 border border-green-200">
                                ✓ Both Parties Submitted
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                                ⏳ Waiting for Party B
                              </Badge>
                            )}
                            {caseItem.assignedTo && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Assigned: {caseItem.assignedTo.firstName}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/cases/${caseItem._id}`);
                          }}
                        >
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
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
                  Showing page {pagination.current} of {pagination.pages} ({pagination.total} total cases)
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

            {/* Empty State (when filters return no results) */}
            {!isLoading && !error && displayCases.length === 0 && (statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search term
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                  >
                    Clear Filters
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

export default AdminDashboard;
