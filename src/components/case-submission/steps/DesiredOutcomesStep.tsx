import React from 'react';
import { Label } from '@/components/ui/label';
import { TextareaWithSpeech } from '@/components/ui/textarea-with-speech';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CaseFormData } from '../CaseSubmissionForm';
import { Target, Clock } from 'lucide-react';

interface DesiredOutcomesStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

const commonGoals = [
  'Reach a fair financial settlement',
  'Improve communication between parties',
  'Establish clear boundaries and expectations',
  'Repair damaged relationships',
  'Create a written agreement',
  'Stop harmful behaviors',
  'Find a win-win solution',
  'Get an apology or acknowledgment',
  'Prevent future conflicts',
  'Simply have our voices heard'
];

const timelines = [
  '1-2 weeks',
  '3-4 weeks',
  '1-2 months',
  '3-6 months',
  'No specific timeline',
  'As soon as possible'
];

export const DesiredOutcomesStep: React.FC<DesiredOutcomesStepProps> = ({ data, updateData }) => {
  const handleChange = (field: string, value: string) => {
    updateData('desiredOutcomes', { [field]: value });
  };

  const handleGoalToggle = (goal: string, checked: boolean) => {
    const currentGoals = data.desiredOutcomes.primaryGoals;
    let newGoals;

    if (checked) {
      newGoals = [...currentGoals, goal];
    } else {
      newGoals = currentGoals.filter(g => g !== goal);
    }

    updateData('desiredOutcomes', { primaryGoals: newGoals });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Target className="w-5 h-5" />
            <p className="text-sm font-medium">
              Let's define what success looks like for you in this mediation
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Primary Goals */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            What are your primary goals for this mediation? (Select all that apply) *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {commonGoals.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={data.desiredOutcomes.primaryGoals.includes(goal)}
                  onCheckedChange={(checked) => handleGoalToggle(goal, checked as boolean)}
                />
                <Label
                  htmlFor={goal}
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-2">
          <Label htmlFor="successMetrics" className="text-base font-medium">
            How will you know if the mediation was successful? *
          </Label>
          <TextareaWithSpeech
            id="successMetrics"
            placeholder="Describe what a successful outcome would look like for you. Be as specific as possible - this helps the mediator understand your priorities and guide the process effectively."
            value={data.desiredOutcomes.successMetrics}
            onChange={(e) => handleChange('successMetrics', e.target.value)}
            className="min-h-[100px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            You can use the microphone button to speak your response.
          </p>
        </div>

        {/* Constraints */}
        <div className="space-y-2">
          <Label htmlFor="constraints" className="text-base font-medium">
            Are there any constraints or non-negotiables we should know about?
          </Label>
          <TextareaWithSpeech
            id="constraints"
            placeholder="Are there things you absolutely cannot or will not agree to? Budget limits? Legal requirements? Time constraints? Personal boundaries?"
            value={data.desiredOutcomes.constraints}
            onChange={(e) => handleChange('constraints', e.target.value)}
            className="min-h-[80px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            This helps ensure we don't waste time on impossible solutions. You can use the microphone button to speak your response.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            What's your preferred timeline for resolution? *
          </Label>
          <Select
            value={data.desiredOutcomes.timeline}
            onValueChange={(value) => handleChange('timeline', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred timeline" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {timelines.map((timeline) => (
                <SelectItem key={timeline} value={timeline}>
                  {timeline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-700">
            <span className="font-medium">Tip:</span> The more specific you are about your desired outcomes,
            the better we can tailor the mediation process to achieve them.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Next:</span> We'll discuss scheduling and your communication preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};