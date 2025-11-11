import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePanelist, useUpdatePanelist, usePanelistDetails } from '@/hooks/admin/useAdminPanelists';
import { createPanelistSchema, updatePanelistSchema, CreatePanelistInput, UpdatePanelistInput } from '@/lib/validations/panelist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, UserPlus } from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { toast } from 'sonner';

const specializationOptions = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'family', label: 'Family' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'property', label: 'Property' },
  { value: 'land', label: 'Land' },
  { value: 'business', label: 'Business' },
  { value: 'employment', label: 'Employment' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'other', label: 'Other' },
];

const PanelistForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Fetch panelist details if editing
  const { data: panelistData, isLoading: loadingPanelist } = usePanelistDetails(id || null);
  const panelist = panelistData?.data.panelist;

  // Mutations
  const createMutation = useCreatePanelist();
  const updateMutation = useUpdatePanelist();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreatePanelistInput | UpdatePanelistInput>({
    resolver: zodResolver(isEditMode ? updatePanelistSchema : createPanelistSchema),
    defaultValues: {
      name: '',
      age: 30,
      occupation: '',
      education: {
        degree: '',
        institution: '',
        yearCompleted: new Date().getFullYear(),
      },
      specializations: [],
      experience: {
        years: 0,
        description: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        alternatePhone: '',
      },
      availability: {
        maxCases: 5,
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      bio: '',
      certifications: [],
      languages: [],
    },
  });

  // Populate form with panelist data in edit mode
  useEffect(() => {
    if (isEditMode && panelist) {
      reset({
        name: panelist.name,
        age: panelist.age,
        occupation: panelist.occupation,
        education: panelist.education,
        specializations: panelist.specializations,
        experience: panelist.experience,
        contactInfo: panelist.contactInfo,
        availability: {
          maxCases: panelist.availability.maxCases,
          status: panelist.availability.status,
        },
        address: panelist.address,
        bio: panelist.bio,
        certifications: panelist.certifications,
        languages: panelist.languages,
      });
    }
  }, [isEditMode, panelist, reset]);

  const selectedSpecializations = watch('specializations') || [];

  const handleSpecializationToggle = (value: string) => {
    const current = selectedSpecializations as string[];
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    setValue('specializations', updated as any);
  };

  const onSubmit = async (data: CreatePanelistInput | UpdatePanelistInput) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          panelistId: id!,
          payload: data as UpdatePanelistInput,
        });
        navigate(`/admin/panelists/${id}`);
      } else {
        const result = await createMutation.mutateAsync(data as CreatePanelistInput);
        navigate(`/admin/panelists/${result.data.panelist._id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEditMode && loadingPanelist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminNavbar />
        <div className="flex items-center justify-center py-12 mt-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading panelist details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavbar />

      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm mt-24">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/panelists')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Panelists
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Panelist' : 'Add New Panelist'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isEditMode ? 'Update panelist information' : 'Add a new panel member to the system'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General information about the panelist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register('name')} placeholder="John Doe" />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    placeholder="45"
                  />
                  {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input id="occupation" {...register('occupation')} placeholder="Mediator, Arbitrator, etc." />
                  {errors.occupation && <p className="text-sm text-red-600 mt-1">{errors.occupation.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="Brief professional biography..."
                    rows={4}
                  />
                  {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Academic qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    {...register('education.degree')}
                    placeholder="Master of Laws"
                  />
                  {errors.education?.degree && (
                    <p className="text-sm text-red-600 mt-1">{errors.education.degree.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearCompleted">Year Completed *</Label>
                  <Input
                    id="yearCompleted"
                    type="number"
                    {...register('education.yearCompleted', { valueAsNumber: true })}
                    placeholder="2010"
                  />
                  {errors.education?.yearCompleted && (
                    <p className="text-sm text-red-600 mt-1">{errors.education.yearCompleted.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    {...register('education.institution')}
                    placeholder="Harvard Law School"
                  />
                  {errors.education?.institution && (
                    <p className="text-sm text-red-600 mt-1">{errors.education.institution.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience & Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Experience & Specializations</CardTitle>
              <CardDescription>Professional experience and areas of expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experienceYears">Years of Experience *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  {...register('experience.years', { valueAsNumber: true })}
                  placeholder="15"
                />
                {errors.experience?.years && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience.years.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="experienceDescription">Experience Description *</Label>
                <Textarea
                  id="experienceDescription"
                  {...register('experience.description')}
                  placeholder="Describe professional experience and achievements..."
                  rows={3}
                />
                {errors.experience?.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience.description.message}</p>
                )}
              </div>

              <div>
                <Label>Specializations * (Select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {specializationOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${option.value}`}
                        checked={selectedSpecializations.includes(option.value)}
                        onCheckedChange={() => handleSpecializationToggle(option.value)}
                      />
                      <Label htmlFor={`spec-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.specializations && (
                  <p className="text-sm text-red-600 mt-1">{errors.specializations.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How to reach the panelist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('contactInfo.email')}
                    placeholder="john.doe@example.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.contactInfo.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...register('contactInfo.phone')}
                    placeholder="+1234567890"
                  />
                  {errors.contactInfo?.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.contactInfo.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    {...register('contactInfo.alternatePhone')}
                    placeholder="+0987654321"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Case load capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxCases">Maximum Cases *</Label>
                  <Input
                    id="maxCases"
                    type="number"
                    {...register('availability.maxCases', { valueAsNumber: true })}
                    placeholder="5"
                  />
                  {errors.availability?.maxCases && (
                    <p className="text-sm text-red-600 mt-1">{errors.availability.maxCases.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum number of cases this panelist can handle simultaneously</p>
                </div>

                {isEditMode && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watch('availability.status')}
                      onValueChange={(value) => setValue('availability.status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Physical address (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street</Label>
                  <Input id="street" {...register('address.street')} placeholder="123 Main St" />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('address.city')} placeholder="New York" />
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" {...register('address.state')} placeholder="NY" />
                </div>

                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" {...register('address.zipCode')} placeholder="10001" />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register('address.country')} placeholder="United States" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/panelists')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Update Panelist
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Panelist
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PanelistForm;
