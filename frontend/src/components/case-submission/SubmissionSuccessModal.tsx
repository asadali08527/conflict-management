import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Copy, Check, LayoutDashboard } from 'lucide-react';
import { FinalSubmissionResponse } from '@/types/case-submission';

interface SubmissionSuccessModalProps {
  open: boolean;
  onClose: () => void;
  response: FinalSubmissionResponse;
  isPartyB: boolean;
  sessionId?: string;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  open,
  onClose,
  response,
  isPartyB,
  sessionId,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewDashboard = () => {
    onClose();
    navigate('/client/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {isPartyB ? 'Response Submitted Successfully!' : 'Case Submitted Successfully!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {response.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Case ID:</span>
                <span className="text-sm font-semibold">{response.caseId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className="text-sm">
                  {isPartyB ? 'Party B Response Submitted' : 'Party A Initial Submission'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Processing Time:</span>
                <span className="text-sm">{response.estimatedProcessingTime}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">Next Steps:</h4>
              <p className="text-sm text-gray-700">{response.nextSteps}</p>
            </CardContent>
          </Card>

          {!isPartyB && sessionId && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Notify the Other Party</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Send them this Session ID so they can submit their perspective:
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-xs font-mono break-all">
                    {sessionId}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySessionId}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Session ID copied to clipboard!</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleViewDashboard} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
