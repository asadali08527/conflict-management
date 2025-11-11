import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Bell,
  MessageSquare,
  Paperclip,
  User,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Hash,
  Menu,
  X
} from 'lucide-react';
import { format, differenceInDays, subDays } from 'date-fns';
import InternalHeader from '@/components/InternalHeader';

interface CaseData {
  id: string;
  title: string;
  parties: string[];
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'under-review' | 'in-mediation' | 'awaiting-documents' | 'ready-for-resolution' | 'closed';
  assignedMediator: string | null;
  dateSubmitted: Date;
  lastActivity: Date;
  description: string;
  estimatedResolution: number;
  progress: number;
  documents: string[];
  communications: Array<{
    id: string;
    author: string;
    type: 'note' | 'email' | 'call' | 'meeting';
    content: string;
    timestamp: Date;
  }>;
  timeline: Array<{
    id: string;
    event: string;
    timestamp: Date;
    author: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

const mockCases: CaseData[] = [
  {
    id: 'CM-2024-001',
    title: 'Property Boundary Dispute',
    parties: ['Johnson Family', 'Smith Residence'],
    type: 'Property',
    priority: 'high',
    status: 'new',
    assignedMediator: null,
    dateSubmitted: subDays(new Date(), 2),
    lastActivity: subDays(new Date(), 1),
    description: 'Disagreement over property line between two adjacent residential properties causing fence installation conflicts.',
    estimatedResolution: 14,
    progress: 10,
    documents: ['Property_Survey_2024.pdf', 'Original_Deed.pdf', 'Fence_Installation_Quote.pdf'],
    communications: [
      {
        id: 'comm1',
        author: 'Sarah Johnson',
        type: 'email',
        content: 'We need to resolve this before winter as we planned fence installation.',
        timestamp: subDays(new Date(), 1)
      }
    ],
    timeline: [
      {
        id: 'tl1',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 2),
        author: 'System'
      },
      {
        id: 'tl2',
        event: 'Initial review completed',
        timestamp: subDays(new Date(), 1),
        author: 'Admin'
      }
    ],
    contactInfo: {
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      address: '123 Maple Street, Anytown, ST 12345'
    }
  },
  {
    id: 'CM-2024-002',
    title: 'Employment Termination Dispute',
    parties: ['David Chen', 'TechCorp Solutions'],
    type: 'Employment',
    priority: 'urgent',
    status: 'under-review',
    assignedMediator: 'Dr. Maria Rodriguez',
    dateSubmitted: subDays(new Date(), 5),
    lastActivity: new Date(),
    description: 'Wrongful termination claim with disagreement over severance package and non-compete clause enforcement.',
    estimatedResolution: 21,
    progress: 35,
    documents: ['Employment_Contract.pdf', 'Termination_Letter.pdf', 'Performance_Reviews.pdf', 'Non_Compete_Agreement.pdf'],
    communications: [
      {
        id: 'comm2',
        author: 'Dr. Maria Rodriguez',
        type: 'note',
        content: 'Initial meeting scheduled with both parties for next week.',
        timestamp: new Date()
      },
      {
        id: 'comm3',
        author: 'David Chen',
        type: 'email',
        content: 'I have additional documentation that supports my position.',
        timestamp: subDays(new Date(), 1)
      }
    ],
    timeline: [
      {
        id: 'tl3',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 5),
        author: 'System'
      },
      {
        id: 'tl4',
        event: 'Assigned to Dr. Rodriguez',
        timestamp: subDays(new Date(), 4),
        author: 'Admin'
      },
      {
        id: 'tl5',
        event: 'Initial review completed',
        timestamp: subDays(new Date(), 3),
        author: 'Dr. Maria Rodriguez'
      }
    ],
    contactInfo: {
      email: 'david.chen@email.com',
      phone: '(555) 987-6543',
      address: '456 Oak Avenue, Business District, ST 12346'
    }
  },
  {
    id: 'CM-2024-003',
    title: 'Family Business Partnership Dissolution',
    parties: ['Robert Wilson', 'Lisa Wilson', 'Wilson Construction LLC'],
    type: 'Business',
    priority: 'medium',
    status: 'in-mediation',
    assignedMediator: 'James Thompson',
    dateSubmitted: subDays(new Date(), 12),
    lastActivity: subDays(new Date(), 2),
    description: 'Family-owned construction business partnership dissolution with disagreements over asset division and client contracts.',
    estimatedResolution: 30,
    progress: 60,
    documents: ['Partnership_Agreement.pdf', 'Financial_Statements_2023.pdf', 'Asset_Valuation.pdf', 'Client_Contracts.pdf'],
    communications: [
      {
        id: 'comm4',
        author: 'James Thompson',
        type: 'meeting',
        content: 'Productive mediation session. Both parties agreed to asset valuation timeline.',
        timestamp: subDays(new Date(), 2)
      }
    ],
    timeline: [
      {
        id: 'tl6',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 12),
        author: 'System'
      },
      {
        id: 'tl7',
        event: 'Assigned to James Thompson',
        timestamp: subDays(new Date(), 10),
        author: 'Admin'
      },
      {
        id: 'tl8',
        event: 'First mediation session',
        timestamp: subDays(new Date(), 8),
        author: 'James Thompson'
      },
      {
        id: 'tl9',
        event: 'Asset valuation requested',
        timestamp: subDays(new Date(), 5),
        author: 'James Thompson'
      }
    ],
    contactInfo: {
      email: 'robert.wilson@wilsonconstruction.com',
      phone: '(555) 246-8135',
      address: '789 Industrial Blvd, Construction Zone, ST 12347'
    }
  },
  {
    id: 'CM-2024-004',
    title: 'Neighbor Noise Complaint',
    parties: ['Margaret Brown', 'Apartment 2B Residents'],
    type: 'Neighbor',
    priority: 'low',
    status: 'awaiting-documents',
    assignedMediator: 'Dr. Sarah Mitchell',
    dateSubmitted: subDays(new Date(), 8),
    lastActivity: subDays(new Date(), 3),
    description: 'Ongoing noise complaints between apartment residents affecting quality of life and sleep patterns.',
    estimatedResolution: 10,
    progress: 40,
    documents: ['Noise_Log.pdf', 'Lease_Agreement.pdf'],
    communications: [
      {
        id: 'comm5',
        author: 'Dr. Sarah Mitchell',
        type: 'note',
        content: 'Waiting for building management noise policy documentation.',
        timestamp: subDays(new Date(), 3)
      }
    ],
    timeline: [
      {
        id: 'tl10',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 8),
        author: 'System'
      },
      {
        id: 'tl11',
        event: 'Assigned to Dr. Mitchell',
        timestamp: subDays(new Date(), 6),
        author: 'Admin'
      }
    ],
    contactInfo: {
      email: 'margaret.brown@email.com',
      phone: '(555) 369-2580',
      address: '321 Pine Street, Apt 1A, Residential Area, ST 12348'
    }
  },
  {
    id: 'CM-2024-005',
    title: 'Divorce Settlement Mediation',
    parties: ['Jennifer Davis', 'Michael Davis'],
    type: 'Family',
    priority: 'high',
    status: 'ready-for-resolution',
    assignedMediator: 'Dr. Maria Rodriguez',
    dateSubmitted: subDays(new Date(), 25),
    lastActivity: subDays(new Date(), 1),
    description: 'Divorce mediation focusing on child custody arrangement and asset division with mutual agreement goal.',
    estimatedResolution: 35,
    progress: 95,
    documents: ['Marriage_Certificate.pdf', 'Financial_Disclosure.pdf', 'Child_Custody_Plan.pdf', 'Asset_Division_Agreement.pdf'],
    communications: [
      {
        id: 'comm6',
        author: 'Dr. Maria Rodriguez',
        type: 'note',
        content: 'Final agreement reached. Preparing documentation for signatures.',
        timestamp: subDays(new Date(), 1)
      }
    ],
    timeline: [
      {
        id: 'tl12',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 25),
        author: 'System'
      },
      {
        id: 'tl13',
        event: 'Assigned to Dr. Rodriguez',
        timestamp: subDays(new Date(), 23),
        author: 'Admin'
      },
      {
        id: 'tl14',
        event: 'Multiple mediation sessions completed',
        timestamp: subDays(new Date(), 15),
        author: 'Dr. Maria Rodriguez'
      },
      {
        id: 'tl15',
        event: 'Agreement finalized',
        timestamp: subDays(new Date(), 2),
        author: 'Dr. Maria Rodriguez'
      }
    ],
    contactInfo: {
      email: 'jennifer.davis@email.com',
      phone: '(555) 147-2589',
      address: '654 Elm Drive, Suburbia, ST 12349'
    }
  },
  {
    id: 'CM-2024-006',
    title: 'Contract Breach Resolution',
    parties: ['Global Supplies Inc', 'Regional Distributors'],
    type: 'Business',
    priority: 'urgent',
    status: 'closed',
    assignedMediator: 'James Thompson',
    dateSubmitted: subDays(new Date(), 45),
    lastActivity: subDays(new Date(), 5),
    description: 'Supply contract breach with delivery timeline violations and quality standards disputes.',
    estimatedResolution: 28,
    progress: 100,
    documents: ['Supply_Contract.pdf', 'Delivery_Records.pdf', 'Quality_Reports.pdf', 'Settlement_Agreement.pdf'],
    communications: [
      {
        id: 'comm7',
        author: 'James Thompson',
        type: 'note',
        content: 'Case successfully resolved with mutual settlement agreement.',
        timestamp: subDays(new Date(), 5)
      }
    ],
    timeline: [
      {
        id: 'tl16',
        event: 'Case submitted',
        timestamp: subDays(new Date(), 45),
        author: 'System'
      },
      {
        id: 'tl17',
        event: 'Case resolved',
        timestamp: subDays(new Date(), 5),
        author: 'James Thompson'
      }
    ],
    contactInfo: {
      email: 'contracts@globalsupplies.com',
      phone: '(555) 789-1234',
      address: '987 Commerce Park, Business Hub, ST 12350'
    }
  }
];

const mockMediators = [
  'Dr. Maria Rodriguez',
  'James Thompson',
  'Dr. Sarah Mitchell',
  'Robert Anderson',
  'Lisa Chang'
];

const statusConfig = {
  'new': { label: 'New Cases', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText },
  'under-review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Eye },
  'in-mediation': { label: 'In Mediation', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Users },
  'awaiting-documents': { label: 'Awaiting Documents', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  'ready-for-resolution': { label: 'Ready for Resolution', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'closed': { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200' }
};

const AdminWork = () => {
  const [cases, setCases] = useState<CaseData[]>(mockCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterMediator, setFilterMediator] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const filteredAndSortedCases = useMemo(() => {
    const filtered = cases.filter(caseItem => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.parties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
      const matchesMediator = filterMediator === 'all' ||
        (filterMediator === 'unassigned' ? !caseItem.assignedMediator : caseItem.assignedMediator === filterMediator);
      const matchesType = filterType === 'all' || caseItem.type === filterType;

      return matchesSearch && matchesStatus && matchesPriority && matchesMediator && matchesType;
    });

    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'date':
          return b.dateSubmitted.getTime() - a.dateSubmitted.getTime();
        case 'activity':
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return sortedFiltered;
  }, [cases, searchTerm, filterStatus, filterPriority, filterMediator, filterType, sortBy]);

  const selectedCase = selectedCaseId ? cases.find(c => c.id === selectedCaseId) : null;

  const handleCaseSelect = (caseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCases);
    if (checked) {
      newSelected.add(caseId);
    } else {
      newSelected.delete(caseId);
    }
    setSelectedCases(newSelected);
  };

  const handleStatusChange = (caseId: string, newStatus: CaseData['status']) => {
    setCases(cases.map(c =>
      c.id === caseId ? { ...c, status: newStatus, lastActivity: new Date() } : c
    ));
  };

  const handleMediatorAssign = (caseId: string, mediator: string) => {
    setCases(cases.map(c =>
      c.id === caseId ? { ...c, assignedMediator: mediator, lastActivity: new Date() } : c
    ));
  };

  const handleBulkStatusChange = (newStatus: CaseData['status']) => {
    setCases(cases.map(c =>
      selectedCases.has(c.id) ? { ...c, status: newStatus, lastActivity: new Date() } : c
    ));
    setSelectedCases(new Set());
  };

  const stats = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter(c => !['closed'].includes(c.status)).length;
    const urgent = cases.filter(c => c.priority === 'urgent' && c.status !== 'closed').length;
    const newCases = cases.filter(c => c.status === 'new').length;
    const inProgress = cases.filter(c => ['under-review', 'in-mediation', 'awaiting-documents', 'ready-for-resolution'].includes(c.status)).length;
    const resolved = cases.filter(c => c.status === 'closed').length;
    const unassigned = cases.filter(c => !c.assignedMediator && c.status !== 'closed').length;

    return { total, pending, urgent, newCases, inProgress, resolved, unassigned };
  }, [cases]);

  const recentActivities = useMemo(() => {
    return cases
      .filter(c => differenceInDays(new Date(), c.lastActivity) <= 7)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        title: c.title,
        action: `Status updated to ${statusConfig[c.status].label}`,
        timestamp: c.lastActivity
      }));
  }, [cases]);

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalHeader showNotifications={true} />

      <div className="flex pt-16">
        {/* Hamburger menu toggle for all screen sizes */}
        <div className="fixed top-20 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white shadow-lg hover:bg-gray-50"
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={`w-64 bg-white shadow-lg h-screen fixed left-0 top-16 overflow-y-auto z-30 transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Case Management</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">OVERVIEW</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm">Total Cases</span>
                    </div>
                    <span className="font-semibold text-blue-600">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm">Urgent</span>
                    </div>
                    <span className="font-semibold text-red-600">{stats.urgent}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">QUICK STATS</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>New Cases</span>
                    <span className="font-medium">{stats.newCases}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>In Progress</span>
                    <span className="font-medium">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Resolved</span>
                    <span className="font-medium">{stats.resolved}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Unassigned</span>
                    <span className="font-medium">{stats.unassigned}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">RECENT ACTIVITY</h3>
                <div className="space-y-2">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <div className="font-medium">{activity.id}</div>
                      <div>{activity.action}</div>
                      <div className="text-gray-400">{format(activity.timestamp, 'MMM dd, HH:mm')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay when sidebar is open on smaller screens */}
        {showSidebar && (
          <div
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-20 top-16"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div className={`flex-1 p-4 md:p-6 transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm md:text-base text-gray-600">Manage all conflict resolution cases</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-xs md:text-sm"
                >
                  List View
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className="text-xs md:text-sm"
                >
                  Kanban View
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-4">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cases, IDs, or parties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white text-xs md:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <SelectItem key={status} value={status}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="bg-white text-xs md:text-sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Priority</SelectItem>
                    {Object.entries(priorityConfig).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterMediator} onValueChange={setFilterMediator}>
                  <SelectTrigger className="bg-white text-xs md:text-sm">
                    <SelectValue placeholder="Mediator" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Mediators</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {mockMediators.map((mediator) => (
                      <SelectItem key={mediator} value={mediator}>{mediator}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white text-xs md:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="date">Date Submitted</SelectItem>
                    <SelectItem value="activity">Last Activity</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCases.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mb-4">
                <span className="text-sm font-medium">{selectedCases.size} cases selected</span>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={handleBulkStatusChange}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <SelectItem key={status} value={status}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCases(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>

          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              {Object.entries(statusConfig).map(([status, config]) => {
                const Icon = config.icon;
                const casesInStatus = filteredAndSortedCases.filter(c => c.status === status);

                return (
                  <div key={status} className="bg-white rounded-lg shadow-sm">
                    <div className="p-3 md:p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-gray-600" />
                          <h3 className="font-medium text-xs md:text-sm">{config.label}</h3>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {casesInStatus.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 min-h-48 md:min-h-96">
                      {casesInStatus.map(caseItem => (
                        <Card
                          key={caseItem.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                          onClick={() => setSelectedCaseId(caseItem.id)}
                        >
                          <CardContent className="p-2 md:p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <Checkbox
                                  checked={selectedCases.has(caseItem.id)}
                                  onCheckedChange={(checked) => handleCaseSelect(caseItem.id, checked as boolean)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Badge variant="outline" className={`${priorityConfig[caseItem.priority].color} text-xs`}>
                                  {priorityConfig[caseItem.priority].label}
                                </Badge>
                              </div>
                            </div>
                            <h4 className="font-medium text-xs md:text-sm mb-1">{caseItem.id}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{caseItem.title}</p>
                            <div className="text-xs text-gray-500 mb-2">
                              <div className="truncate">{caseItem.parties.join(' vs ')}</div>
                              <div>{differenceInDays(new Date(), caseItem.dateSubmitted)} days ago</div>
                            </div>
                            {caseItem.assignedMediator && (
                              <div className="flex items-center text-xs text-gray-600">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">{caseItem.assignedMediator}</span>
                              </div>
                            )}
                            <Progress value={caseItem.progress} className="mt-2 h-2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox
                          checked={selectedCases.size === filteredAndSortedCases.length && filteredAndSortedCases.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCases(new Set(filteredAndSortedCases.map(c => c.id)));
                            } else {
                              setSelectedCases(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mediator</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCases.map(caseItem => (
                      <tr
                        key={caseItem.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedCaseId(caseItem.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedCases.has(caseItem.id)}
                            onCheckedChange={(checked) => handleCaseSelect(caseItem.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {caseItem.id}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {caseItem.title}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {caseItem.parties.join(' vs ')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {caseItem.type}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={priorityConfig[caseItem.priority].color}>
                            {priorityConfig[caseItem.priority].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={statusConfig[caseItem.status].color}>
                            {statusConfig[caseItem.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {caseItem.assignedMediator || 'Unassigned'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Progress value={caseItem.progress} className="w-16 h-2 mr-2" />
                            <span className="text-sm text-gray-600">{caseItem.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {differenceInDays(new Date(), caseItem.dateSubmitted)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCaseId(caseItem.id);
                          }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={selectedCaseId !== null} onOpenChange={() => setSelectedCaseId(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Case Details: {selectedCase?.id}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={selectedCase ? priorityConfig[selectedCase.priority].color : ''}>
                  {selectedCase ? priorityConfig[selectedCase.priority].label : ''}
                </Badge>
                <Badge variant="outline" className={selectedCase ? statusConfig[selectedCase.status].color : ''}>
                  {selectedCase ? statusConfig[selectedCase.status].label : ''}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 text-xs md:text-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Case Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Title</label>
                        <p className="mt-1">{selectedCase.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="mt-1 text-gray-700">{selectedCase.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Parties Involved</label>
                        <div className="mt-1 space-y-1">
                          {selectedCase.parties.map((party, index) => (
                            <div key={index} className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              {party}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Case Type</label>
                          <p className="mt-1">{selectedCase.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Submitted</label>
                          <p className="mt-1">{format(selectedCase.dateSubmitted, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Progress & Assignment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Progress</label>
                        <div className="mt-2">
                          <Progress value={selectedCase.progress} className="h-3" />
                          <p className="text-sm text-gray-600 mt-1">{selectedCase.progress}% Complete</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Assigned Mediator</label>
                        <div className="mt-1">
                          <Select
                            value={selectedCase.assignedMediator || 'unassigned'}
                            onValueChange={(value) => handleMediatorAssign(selectedCase.id, value === 'unassigned' ? '' : value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {mockMediators.map((mediator) => (
                                <SelectItem key={mediator} value={mediator}>{mediator}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <div className="mt-1">
                          <Select
                            value={selectedCase.status}
                            onValueChange={(value) => handleStatusChange(selectedCase.id, value as CaseData['status'])}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {Object.entries(statusConfig).map(([status, config]) => (
                                <SelectItem key={status} value={status}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Estimated Resolution</label>
                        <p className="mt-1">{selectedCase.estimatedResolution} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedCase.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedCase.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedCase.contactInfo.address}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="communications">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Communication History</h3>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedCase.communications.map((comm) => (
                      <div key={comm.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="font-medium">{comm.author}</div>
                            <Badge variant="outline" className="ml-2">
                              {comm.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(comm.timestamp, 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        <p className="text-gray-700">{comm.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Case Documents</h3>
                    <Button size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCase.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-gray-500" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="space-y-4">
                  <h3 className="font-semibold">Case Timeline</h3>
                  <div className="space-y-4">
                    {selectedCase.timeline.map((event) => (
                      <div key={event.id} className="flex items-start">
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div className="ml-4">
                          <div className="font-medium">{event.event}</div>
                          <div className="text-sm text-gray-600">{event.author}</div>
                          <div className="text-sm text-gray-500">
                            {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions">
                <div className="space-y-4">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button className="justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email Update
                    </Button>
                    <Button className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button className="justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate Priority
                    </Button>
                    <Button className="justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Reassign Mediator
                    </Button>
                    <Button className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWork;