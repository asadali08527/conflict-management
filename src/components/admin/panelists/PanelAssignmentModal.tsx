import React, { useState, useMemo } from 'react';
import { useAvailablePanelists, useAssignPanelToCase } from '@/hooks/admin/useAdminPanelists';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Loader2,
  AlertCircle,
  UserPlus,
  Star,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { Panelist } from '@/types/panelist.types';

interface PanelAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  caseType?: string;
  onSuccess?: () => void;
}

export const PanelAssignmentModal: React.FC<PanelAssignmentModalProps> = ({
  open,
  onOpenChange,
  caseId,
  caseType,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPanelistIds, setSelectedPanelistIds] = useState<string[]>([]);

  // Fetch available panelists
  const { data, isLoading, error } = useAvailablePanelists({
    caseType: caseType,
  });

  // Assign panel mutation
  const assignMutation = useAssignPanelToCase();

  const panelists = data?.data.panelists || [];

  // Filter panelists by search term
  const filteredPanelists = useMemo(() => {
    if (!searchTerm) return panelists;
    const search = searchTerm.toLowerCase();
    return panelists.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.occupation.toLowerCase().includes(search) ||
        p.specializations.some((s) => s.toLowerCase().includes(search))
    );
  }, [panelists, searchTerm]);

  const handleTogglePanelist = (panelistId: string) => {
    setSelectedPanelistIds((prev) =>
      prev.includes(panelistId)
        ? prev.filter((id) => id !== panelistId)
        : [...prev, panelistId]
    );
  };

  const handleAssign = async () => {
    if (selectedPanelistIds.length === 0) return;

    try {
      await assignMutation.mutateAsync({
        caseId,
        payload: { panelistIds: selectedPanelistIds },
      });
      setSelectedPanelistIds([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to assign panel:', error);
    }
  };

  const getWorkloadPercentage = (currentLoad: number, maxCases: number) => {
    return Math.round((currentLoad / maxCases) * 100);
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Panel Members
          </DialogTitle>
          <DialogDescription>
            Select one or more panelists to assign to this case. Only available panelists
            {caseType && ` specializing in ${caseType} cases`} are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, occupation, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {selectedPanelistIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedPanelistIds.length} panelist{selectedPanelistIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPanelistIds([])}
                className="text-blue-700 hover:text-blue-900"
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading available panelists...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load panelists</p>
                <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
              </div>
            </div>
          )}

          {/* Panelists List */}
          {!isLoading && !error && (
            <ScrollArea className="h-[400px] pr-4">
              {filteredPanelists.length > 0 ? (
                <div className="space-y-3">
                  {filteredPanelists.map((panelist) => {
                    const isSelected = selectedPanelistIds.includes(panelist._id);
                    const workloadPercentage = getWorkloadPercentage(
                      panelist.availability.currentCaseLoad || 0,
                      panelist.availability.maxCases
                    );

                    return (
                      <div
                        key={panelist._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTogglePanelist(panelist._id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleTogglePanelist(panelist._id)}
                            className="mt-1"
                          />

                          {/* Avatar */}
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {panelist.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{panelist.name}</h4>
                              {panelist.rating && panelist.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {panelist.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{panelist.occupation}</p>

                            {/* Specializations */}
                            <div className="flex items-center gap-1 flex-wrap mb-2">
                              {panelist.specializations.slice(0, 4).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">
                                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                </Badge>
                              ))}
                              {panelist.specializations.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{panelist.specializations.length - 4}
                                </Badge>
                              )}
                            </div>

                            {/* Experience & Workload */}
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{panelist.experience.years} years exp.</span>
                              <span>•</span>
                              <span>
                                {panelist.availability.currentCaseLoad || 0}/{panelist.availability.maxCases} cases
                              </span>
                            </div>

                            {/* Workload Bar */}
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`${getWorkloadColor(workloadPercentage)} h-1.5 rounded-full transition-all`}
                                  style={{ width: `${workloadPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Selected Indicator */}
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">No panelists found</h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm
                      ? 'Try adjusting your search term'
                      : 'No available panelists match the criteria'}
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedPanelistIds.length === 0 || assignMutation.isPending}
            className="gap-2"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Assign Panel ({selectedPanelistIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
