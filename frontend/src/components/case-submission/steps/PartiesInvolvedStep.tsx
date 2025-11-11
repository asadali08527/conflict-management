import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CaseFormData } from '../CaseSubmissionForm';
import { Users, Plus, Trash2 } from 'lucide-react';

interface PartiesInvolvedStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

const partyRoles = [
  "Spouse/Partner",  
  "Child",  
  "Parent",  
  "Legal Representative",  
  "Mediator",  
  "Counselor",  
  "Other Family Member",  
  "Other"
];

const relationships = [
  "Married Couple", "Ex-Spouses", "Parent-Child", "Siblings", "Extended Family", "Legal Advisors", "Professional Support", "Other"
];

export const PartiesInvolvedStep: React.FC<PartiesInvolvedStepProps> = ({ data, updateData }) => {
  const addParty = () => {
    const newParties = [
      ...data.partiesInvolved.parties,
      { name: '', role: '', email: '', phone: '', relationship: '' }
    ];
    updateData('partiesInvolved', { parties: newParties });
  };

  const removeParty = (index: number) => {
    if (data.partiesInvolved.parties.length > 1) {
      const newParties = data.partiesInvolved.parties.filter((_, i) => i !== index);
      updateData('partiesInvolved', { parties: newParties });
    }
  };

  const updateParty = (index: number, field: string, value: string) => {
    const newParties = [...data.partiesInvolved.parties];
    newParties[index] = { ...newParties[index], [field]: value };
    updateData('partiesInvolved', { parties: newParties });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="w-5 h-5" />
            <p className="text-sm font-medium">
              Tell us about everyone involved in this conflict
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data.partiesInvolved.parties.map((party, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {index === 0 ? 'You (Primary Party)' : `Party ${index + 1}`}
                </CardTitle>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParty(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    placeholder="Enter full name"
                    value={party.name}
                    onChange={(e) => updateParty(index, 'name', e.target.value)}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Role in Conflict *
                  </Label>
                  <Select
                    value={party.role}
                    onValueChange={(value) => updateParty(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {partyRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={party.email}
                    onChange={(e) => updateParty(index, 'email', e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Phone Number (optional)
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={party.phone}
                    onChange={(e) => updateParty(index, 'phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Relationship */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Relationship to Other Parties *
                </Label>
                <Select
                  value={party.relationship}
                  onValueChange={(value) => updateParty(index, 'relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    {relationships.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Party Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              onClick={addParty}
              className="w-full h-16 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Party
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Next:</span> We'll explore the background and timeline of this conflict.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};