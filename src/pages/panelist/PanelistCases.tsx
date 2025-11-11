import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePanelistCases } from '@/hooks/panelist/usePanelistCases';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const PanelistCases = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Build query params for API
  const queryParams = {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    type: typeFilter !== 'all' ? typeFilter as any : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as any : undefined,
  };

  // Use the hook to fetch cases
  const { cases, isLoading, error } = usePanelistCases(queryParams);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      open: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
      assigned: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: AlertCircle },
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

  const getTypeLabel = (type: string) => {
    const typeMap = {
      marriage: 'Marriage',
      land: 'Land',
      property: 'Property',
      family: 'Family',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PanelistNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-2">Manage and review your assigned cases</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="marriage">Marriage</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                  </div>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading cases</h3>
              <p className="text-gray-600">
                {(error as any)?.response?.data?.message || 'Failed to load cases. Please try again.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cases List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {cases.map((caseItem) => {
              const statusInfo = getStatusInfo(caseItem.status);
              const priorityInfo = getPriorityInfo(caseItem.priority);
              const StatusIcon = statusInfo.icon;

              return (
                <Card
                  key={caseItem._id}
                  className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
                  onClick={() => navigate(`/panelist/cases/${caseItem._id}`)}
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
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Case ID: <span className="font-mono font-medium">{caseItem.caseId}</span>
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">{caseItem.description}</p>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Parties Involved
                            </p>
                            <div className="space-y-1">
                              {caseItem.parties?.slice(0, 2).map((party, idx) => (
                                <p key={idx} className="text-sm text-gray-900">
                                  {party.firstName} {party.lastName}
                                </p>
                              ))}
                              {caseItem.parties?.length > 2 && (
                                <p className="text-xs text-gray-500">+{caseItem.parties.length - 2} more</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Type
                            </p>
                            <p className="text-sm text-gray-900">{getTypeLabel(caseItem.type)}</p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Assigned On
                            </p>
                            <p className="text-sm text-gray-900">
                              {caseItem.assignedAt
                                ? format(new Date(caseItem.assignedAt), 'MMM dd, yyyy')
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
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/panelist/cases/${caseItem._id}`);
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

            {/* Empty State */}
            {cases.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600">
                    You don't have any cases assigned yet. Check back later for new assignments.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelistCases;
