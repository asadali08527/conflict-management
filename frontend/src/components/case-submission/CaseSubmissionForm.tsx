import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  caseSubmissionService,
  sessionManager,
  handleCaseSubmissionError,
} from '@/services/case-submission';
import {
  Step1Payload,
  Step2Payload,
  Step3Payload,
  Step4Payload,
  Step5Payload,
  Step6FormData,
  FinalSubmissionResponse,
} from '@/types/case-submission';
import { CaseOverviewStep } from './steps/CaseOverviewStep';
import { PartiesInvolvedStep } from './steps/PartiesInvolvedStep';
import { ConflictBackgroundStep } from './steps/ConflictBackgroundStep';
import { DesiredOutcomesStep } from './steps/DesiredOutcomesStep';
import { SchedulingPreferencesStep } from './steps/SchedulingPreferencesStep';
import {
  DocumentUploadStep,
  DocumentUploadStepRef,
} from './steps/DocumentUploadStep';
import { PartyBJoinModal } from './PartyBJoinModal';
import { SubmissionSuccessModal } from './SubmissionSuccessModal';

export interface CaseFormData {
  caseOverview: {
    conflictType: string;
    description: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    estimatedValue?: string;
  };
  partiesInvolved: {
    parties: Array<{
      name: string;
      role: string;
      email: string;
      phone?: string;
      relationship: string;
    }>;
  };
  conflictBackground: {
    timeline: string;
    keyIssues: string[];
    previousAttempts: string;
    emotionalImpact: string;
  };
  desiredOutcomes: {
    primaryGoals: string[];
    successMetrics: string;
    constraints: string;
    timeline: string;
  };
  schedulingPreferences: {
    availability: string[];
    preferredLocation: 'online' | 'in-person' | 'hybrid';
    timeZone: string;
    communicationPreference: 'email' | 'phone' | 'text' | 'app';
  };
  documents: {
    files: Array<{
      name: string;
      url: string;
      key: string;
      size: number;
      mimetype: string;
      description?: string;
    }>;
  };
}

const initialFormData: CaseFormData = {
  caseOverview: {
    conflictType: '',
    description: '',
    urgencyLevel: 'medium',
    estimatedValue: '',
  },
  partiesInvolved: {
    parties: [{ name: '', role: '', email: '', phone: '', relationship: '' }],
  },
  conflictBackground: {
    timeline: '',
    keyIssues: [],
    previousAttempts: '',
    emotionalImpact: '',
  },
  desiredOutcomes: {
    primaryGoals: [],
    successMetrics: '',
    constraints: '',
    timeline: '',
  },
  schedulingPreferences: {
    availability: [],
    preferredLocation: 'online',
    timeZone: '',
    communicationPreference: 'email',
  },
  documents: {
    files: [],
  },
};

const steps = [
  { id: 1, title: 'Case Overview', component: CaseOverviewStep },
  { id: 2, title: 'Parties Involved', component: PartiesInvolvedStep },
  { id: 3, title: 'Conflict Background', component: ConflictBackgroundStep },
  { id: 4, title: 'Desired Outcomes', component: DesiredOutcomesStep },
  { id: 5, title: 'Scheduling', component: SchedulingPreferencesStep },
  { id: 6, title: 'Documents', component: DocumentUploadStep },
];

export const CaseSubmissionForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CaseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [isPartyB, setIsPartyB] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [submissionResponse, setSubmissionResponse] =
    useState<FinalSubmissionResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Ref for DocumentUploadStep to trigger file uploads
  const documentUploadRef = useRef<DocumentUploadStepRef>(null);

  const progress = (currentStep / steps.length) * 100;

  // Check for existing session or show join modal
  useEffect(() => {
    const initializeForm = async () => {
      const existingSessionId = sessionManager.getSessionId();
      const existingIsPartyB = sessionManager.getIsPartyB();

      if (existingSessionId) {
        // Resume existing session
        setSessionId(existingSessionId);
        setIsPartyB(existingIsPartyB);
        const savedStep = sessionManager.getCurrentStep();
        setCurrentStep(savedStep);
      } else {
        // Show join modal for new users
        setShowJoinModal(true);
      }
    };

    initializeForm();
  }, []);

  // Handle starting a new case (Party A) - Just close modal and show form
  const handleStartNewCase = () => {
    setShowJoinModal(false);
    setSessionId('new'); // Use temporary ID to show form
    setIsPartyB(false);
    setCurrentStep(1);
  };

  // Handle Party B joining successfully
  const handlePartyBJoinSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    setIsPartyB(true);
    setCurrentStep(1);
    setShowJoinModal(false);
  };

  const updateFormData = (
    section: keyof CaseFormData,
    data: Partial<CaseFormData[keyof CaseFormData]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const submitCurrentStep = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setStepErrors({});

      // For Party A on step 1, create session first if it's a new case
      let actualSessionId = sessionId;
      if (currentStep === 1 && sessionId === 'new' && !isPartyB) {
        const newSessionId = await sessionManager.initializeSession();
        setSessionId(newSessionId);
        actualSessionId = newSessionId;
      }

      if (!actualSessionId || actualSessionId === 'new') {
        setError('Session not initialized');
        return false;
      }

      switch (currentStep) {
        case 1: {
          const payload: Step1Payload = {
            stepId: 1,
            sessionId: actualSessionId,
            caseOverview: formData.caseOverview,
          };
          await caseSubmissionService.submitStep1(payload);
          break;
        }
        case 2: {
          const payload: Step2Payload = {
            stepId: 2,
            sessionId: actualSessionId,
            partiesInvolved: formData.partiesInvolved,
          };
          await caseSubmissionService.submitStep2(payload);
          break;
        }
        case 3: {
          const payload: Step3Payload = {
            stepId: 3,
            sessionId: actualSessionId,
            conflictBackground: formData.conflictBackground,
          };
          await caseSubmissionService.submitStep3(payload);
          break;
        }
        case 4: {
          const payload: Step4Payload = {
            stepId: 4,
            sessionId: actualSessionId,
            desiredOutcomes: formData.desiredOutcomes,
          };
          await caseSubmissionService.submitStep4(payload);
          break;
        }
        case 5: {
          const payload: Step5Payload = {
            stepId: 5,
            sessionId: actualSessionId,
            schedulingPreferences: formData.schedulingPreferences,
          };
          await caseSubmissionService.submitStep5(payload);
          break;
        }
        case 6: {
          // First, upload all files to S3
          if (documentUploadRef.current) {
            try {
              const uploadedFiles =
                await documentUploadRef.current.uploadAllFiles();

              // Validate that at least 1 file was uploaded
              if (uploadedFiles.length === 0) {
                throw new Error(
                  'Please upload at least 1 document to submit your case.'
                );
              }
              // Files are now uploaded and saved to database with sessionId
              // No need to send them to step6 endpoint
            } catch (uploadError) {
              throw uploadError;
            }
          }

          // Then submit step 6 WITHOUT files (they're already in the database)
          const payload: Step6FormData = {
            stepId: 6,
            sessionId: actualSessionId,
          };
          await caseSubmissionService.submitStep6(payload);
          break;
        }
      }
      return true;
    } catch (error) {
      const errorMessage = handleCaseSubmissionError(error);
      setStepErrors({ [currentStep]: errorMessage });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      const success = await submitCurrentStep();
      if (success) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        sessionManager.setCurrentStep(newStep);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      sessionManager.setCurrentStep(newStep);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) {
      setError('Session not initialized');
      return;
    }

    setIsSubmitting(true);
    try {
      setError(null);

      // First, submit the current step (step 6) - this will upload files and validate
      const stepSuccess = await submitCurrentStep();
      if (!stepSuccess) {
        return;
      }

      // Then submit the final case
      const response = await caseSubmissionService.submitCase({
        sessionId,
        submittedAt: new Date().toISOString(),
        submitterUserId: user?.id,
      });

      // Store response and show success modal
      setSubmissionResponse(response);
      setShowSuccessModal(true);
    } catch (error) {
      const errorMessage = handleCaseSubmissionError(error);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    sessionManager.clearSession();
    // Reset form state
    setSessionId(null);
    setIsPartyB(false);
    setCurrentStep(1);
    setFormData(initialFormData);
    setSubmissionResponse(null);
    // Redirect to client dashboard
    navigate('/client/dashboard');
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  // Show loading screen while initializing session
  if (isLoading && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing case submission...</p>
        </div>
      </div>
    );
  }

  // Don't render form until session is initialized
  if (!sessionId) {
    return (
      <>
        {error && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
        <PartyBJoinModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          onJoinSuccess={handlePartyBJoinSuccess}
          onStartNewCase={handleStartNewCase}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Party B Join Modal */}
      <PartyBJoinModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onJoinSuccess={handlePartyBJoinSuccess}
        onStartNewCase={handleStartNewCase}
      />

      {/* Success Modal */}
      {submissionResponse && (
        <SubmissionSuccessModal
          open={showSuccessModal}
          onClose={handleSuccessModalClose}
          response={submissionResponse}
          isPartyB={isPartyB}
          sessionId={
            isPartyB ? undefined : sessionManager.getSessionId() || undefined
          }
        />
      )}
      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Party Badge Indicator */}
      {isPartyB && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-600 text-white">
                Party B - Respondent
              </Badge>
              <p className="text-sm text-purple-900">
                You are responding to an existing case submission.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isPartyB && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-600 text-white">
                Party A - Original Submitter
              </Badge>
              <p className="text-sm text-blue-900">
                You are initiating a new case submission.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Step {currentStep} of {steps.length}
            </h2>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`${
                  index + 1 <= currentStep ? 'text-blue-600 font-medium' : ''
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  {steps[currentStep - 1].title}
                </h3>
              </div>

              {currentStep === 6 ? (
                <DocumentUploadStep
                  ref={documentUploadRef}
                  data={formData}
                  updateData={updateFormData}
                />
              ) : (
                <CurrentStepComponent
                  data={formData}
                  updateData={updateFormData}
                />
              )}

              {/* Step Error Display */}
              {stepErrors[currentStep] && (
                <Card className="border-red-200 bg-red-50 mt-4">
                  <CardContent className="p-4">
                    <p className="text-red-700 text-sm">
                      {stepErrors[currentStep]}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading || isSubmitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Case...
                  </>
                ) : (
                  'Submit Case'
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={isLoading || isSubmitting}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
