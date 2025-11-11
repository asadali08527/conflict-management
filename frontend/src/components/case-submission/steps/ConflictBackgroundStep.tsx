import React from 'react';
import { Label } from '@/components/ui/label';
import { TextareaWithSpeech } from '@/components/ui/textarea-with-speech';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CaseFormData } from '../CaseSubmissionForm';
import { History, AlertCircle } from 'lucide-react';

interface ConflictBackgroundStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

const commonIssues = [
  'Communication breakdown',
  'Misaligned expectations',
  'Financial disputes',
  'Trust issues',
  'Contract violations',
  'Property boundaries',
  'Work responsibilities',
  'Time/deadline conflicts',
  'Quality of work/service',
  'Personal disagreements'
];

export const ConflictBackgroundStep: React.FC<ConflictBackgroundStepProps> = ({ data, updateData }) => {
  const handleChange = (field: string, value: string) => {
    updateData('conflictBackground', { [field]: value });
  };

  const handleIssueToggle = (issue: string, checked: boolean) => {
    const currentIssues = data.conflictBackground.keyIssues;
    let newIssues;

    if (checked) {
      newIssues = [...currentIssues, issue];
    } else {
      newIssues = currentIssues.filter(i => i !== issue);
    }

    updateData('conflictBackground', { keyIssues: newIssues });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <History className="w-5 h-5" />
            <p className="text-sm font-medium">
              Help us understand how this conflict developed and what's at stake
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Timeline */}
        <div className="space-y-2">
          <Label htmlFor="timeline" className="text-base font-medium">
            How did this conflict start and develop? *
          </Label>
          <TextareaWithSpeech
            id="timeline"
            placeholder="Describe the sequence of events that led to this conflict. When did it start? What key events happened? How has it escalated or changed over time?"
            value={data.conflictBackground.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="min-h-[120px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            You can use the microphone button to speak your response.
          </p>
        </div>

        {/* Key Issues */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            What are the main issues involved? (Select all that apply) *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonIssues.map((issue) => (
              <div key={issue} className="flex items-center space-x-2">
                <Checkbox
                  id={issue}
                  checked={data.conflictBackground.keyIssues.includes(issue)}
                  onCheckedChange={(checked) => handleIssueToggle(issue, checked as boolean)}
                />
                <Label
                  htmlFor={issue}
                  className="text-sm font-normal cursor-pointer"
                >
                  {issue}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Select the issues that best describe the core problems in this conflict
          </p>
        </div>

        {/* Previous Attempts */}
        <div className="space-y-2">
          <Label htmlFor="previousAttempts" className="text-base font-medium">
            What attempts have been made to resolve this conflict? *
          </Label>
          <TextareaWithSpeech
            id="previousAttempts"
            placeholder="Describe any conversations, meetings, negotiations, or other efforts that have been made to resolve this conflict. What worked? What didn't work? Why are you seeking mediation now?"
            value={data.conflictBackground.previousAttempts}
            onChange={(e) => handleChange('previousAttempts', e.target.value)}
            className="min-h-[100px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            You can use the microphone button to speak your response.
          </p>
        </div>

        {/* Emotional Impact */}
        <div className="space-y-2">
          <Label htmlFor="emotionalImpact" className="text-base font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            How has this conflict affected you and others involved?
          </Label>
          <TextareaWithSpeech
            id="emotionalImpact"
            placeholder="Describe the emotional, relational, or business impact this conflict has had. This helps us understand the urgency and approach needed for mediation."
            value={data.conflictBackground.emotionalImpact}
            onChange={(e) => handleChange('emotionalImpact', e.target.value)}
            className="min-h-[100px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            Understanding the impact helps us tailor our approach and prioritize your case. You can use the microphone button to speak your response.
          </p>
        </div>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Next:</span> We'll discuss what you hope to achieve through mediation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};