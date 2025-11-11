import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { sessionManager, handleCaseSubmissionError } from '@/services/case-submission';

interface PartyBJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinSuccess: (sessionId: string) => void;
  onStartNewCase: () => void;
}

export const PartyBJoinModal: React.FC<PartyBJoinModalProps> = ({
  open,
  onOpenChange,
  onJoinSuccess,
  onStartNewCase,
}) => {
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinCase = async () => {
    if (!sessionId.trim()) {
      setError('Please enter a valid Session ID');
      return;
    }

    // Basic UUID validation
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(sessionId.trim())) {
      setError('Invalid Session ID format. Please check and try again.');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const newSessionId = await sessionManager.joinAsPartyB(sessionId.trim());
      onJoinSuccess(newSessionId);
      onOpenChange(false);
    } catch (error) {
      const errorMessage = handleCaseSubmissionError(error);
      setError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartNew = () => {
    onStartNewCase();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // When closing modal, trigger start new case
      onStartNewCase();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Existing Case</DialogTitle>
          <DialogDescription>
            Are you responding to an existing case submission? Enter the Session ID
            you received to provide your perspective on the conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="session-id">Session ID</Label>
            <Input
              id="session-id"
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isJoining) {
                  handleJoinCase();
                }
              }}
              disabled={isJoining}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              The Session ID should have been provided to you via email or SMS.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleStartNew}
            disabled={isJoining}
          >
            Start New Case
          </Button>
          <Button
            onClick={handleJoinCase}
            disabled={isJoining || !sessionId.trim()}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Case'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
