import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextareaWithSpeech } from '@/components/ui/textarea-with-speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CaseFormData } from '../CaseSubmissionForm';
import { FileText, AlertTriangle, DollarSign } from 'lucide-react';

interface CaseOverviewStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

const conflictTypes = [
  'Marital Conflict',
  'Divorce Proceedings',
  'Property Division',
  'Child Custody',
  'Financial Disputes',
  'Communication Issues',
  'Family Mediation',
  'Other'
]

const urgencyLevels = [
  { value: 'low', label: 'Low - Can wait weeks', color: 'text-green-600' },
  { value: 'medium', label: 'Medium - Within days', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Within 24-48 hours', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent - Immediate attention', color: 'text-red-600' }
];

export const CaseOverviewStep: React.FC<CaseOverviewStepProps> = ({ data, updateData }) => {
  const handleChange = (field: string, value: string) => {
    updateData('caseOverview', { [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5" />
            <p className="text-sm font-medium">
              Help us understand the nature and scope of your conflict
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Conflict Type */}
        <div className="space-y-2">
          <Label htmlFor="conflictType" className="text-base font-medium">
            What type of conflict is this? *
          </Label>
          <Select
            value={data.caseOverview.conflictType}
            onValueChange={(value) => handleChange('conflictType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select conflict type" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {conflictTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">
            Brief description of the conflict *
          </Label>
          <TextareaWithSpeech
            id="description"
            placeholder="Provide a brief overview of what the conflict is about, key issues, and what brought you here..."
            value={data.caseOverview.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="min-h-[120px] resize-none"
            mode="append"
          />
          <p className="text-sm text-gray-500">
            Don't worry about details here - we'll cover those in later steps. You can use the microphone button to speak your response.
          </p>
        </div>

        {/* Urgency Level */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            How urgent is this situation? *
          </Label>
          <Select
            value={data.caseOverview.urgencyLevel}
            onValueChange={(value) => handleChange('urgencyLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select urgency level" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <span className={level.color}>
                    {level.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Value */}
        <div className="space-y-2">
          <Label htmlFor="estimatedValue" className="text-base font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Estimated financial impact (optional)
          </Label>
          <Input
            id="estimatedValue"
            type="text"
            placeholder="e.g., $10,000 or Under $1,000"
            value={data.caseOverview.estimatedValue}
            onChange={(e) => handleChange('estimatedValue', e.target.value)}
          />
          <p className="text-sm text-gray-500">
            This helps us understand the scope and assign the right mediator
          </p>
        </div>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Next:</span> We'll gather information about all parties involved in this conflict.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};