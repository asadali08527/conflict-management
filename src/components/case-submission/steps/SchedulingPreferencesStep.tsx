import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CaseFormData } from '../CaseSubmissionForm';
import { Calendar, MapPin, MessageSquare, Clock } from 'lucide-react';

interface SchedulingPreferencesStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

const availabilityOptions = [
  'Weekday mornings (9 AM - 12 PM)',
  'Weekday afternoons (12 PM - 5 PM)',
  'Weekday evenings (5 PM - 8 PM)',
  'Saturday mornings (9 AM - 12 PM)',
  'Saturday afternoons (12 PM - 5 PM)',
  'Sunday afternoons (12 PM - 5 PM)',
  'Flexible - any time that works for all parties'
];

const timeZones = [
  'Eastern Time (ET)',
  'Central Time (CT)',
  'Mountain Time (MT)',
  'Pacific Time (PT)',
  'Alaska Time (AKST)',
  'Hawaii Time (HST)',
  'Other/International'
];

const locationOptions = [
  { value: 'online', label: 'Online/Virtual', description: 'Video conferencing (Zoom, Teams, etc.)' },
  { value: 'in-person', label: 'In-Person', description: 'Physical meeting location' },
  { value: 'hybrid', label: 'Hybrid', description: 'Some online, some in-person sessions' }
];

const communicationOptions = [
  { value: 'email', label: 'Email', description: 'Primary contact via email' },
  { value: 'phone', label: 'Phone calls', description: 'Prefer phone communication' },
  { value: 'text', label: 'Text messages', description: 'SMS for quick updates' },
  { value: 'app', label: 'App notifications', description: 'In-app messaging system' }
];

export const SchedulingPreferencesStep: React.FC<SchedulingPreferencesStepProps> = ({ data, updateData }) => {
  const handleAvailabilityToggle = (option: string, checked: boolean) => {
    const currentAvailability = data.schedulingPreferences.availability;
    let newAvailability;

    if (checked) {
      newAvailability = [...currentAvailability, option];
    } else {
      newAvailability = currentAvailability.filter(a => a !== option);
    }

    updateData('schedulingPreferences', { availability: newAvailability });
  };

  const handleLocationChange = (value: string) => {
    updateData('schedulingPreferences', { preferredLocation: value });
  };

  const handleTimeZoneChange = (value: string) => {
    updateData('schedulingPreferences', { timeZone: value });
  };

  const handleCommunicationChange = (value: string) => {
    updateData('schedulingPreferences', { communicationPreference: value });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-5 h-5" />
            <p className="text-sm font-medium">
              Help us schedule sessions that work for everyone involved
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Availability */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            When are you typically available? (Select all that apply) *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {availabilityOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={data.schedulingPreferences.availability.includes(option)}
                  onCheckedChange={(checked) => handleAvailabilityToggle(option, checked as boolean)}
                />
                <Label
                  htmlFor={option}
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Zone */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            What time zone are you in? *
          </Label>
          <Select
            value={data.schedulingPreferences.timeZone}
            onValueChange={handleTimeZoneChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your time zone" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {timeZones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Location */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Where would you prefer to hold mediation sessions? *
          </Label>
          <RadioGroup
            value={data.schedulingPreferences.preferredLocation}
            onValueChange={handleLocationChange}
            className="grid grid-cols-1 gap-4"
          >
            {locationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={option.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Communication Preference */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            How would you prefer to receive updates and communications? *
          </Label>
          <RadioGroup
            value={data.schedulingPreferences.communicationPreference}
            onValueChange={handleCommunicationChange}
            className="grid grid-cols-1 gap-4"
          >
            {communicationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={option.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-700">
            <span className="font-medium">Note:</span> We'll coordinate with all parties to find times that work for everyone.
            The more flexible you can be, the faster we can get started.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Final Step:</span> Upload any relevant documents or evidence to support your case.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};