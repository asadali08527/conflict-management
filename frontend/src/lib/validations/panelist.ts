import { z } from 'zod';

// Education schema
export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  yearCompleted: z
    .number()
    .min(1950, 'Year must be after 1950')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
});

// Experience schema
export const experienceSchema = z.object({
  years: z.number().min(0, 'Years of experience cannot be negative').max(70, 'Years must be reasonable'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

// Contact info schema
export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  alternatePhone: z.string().optional(),
});

// Availability schema
export const availabilitySchema = z.object({
  status: z.enum(['available', 'busy', 'unavailable']).optional(),
  maxCases: z.number().min(1, 'Max cases must be at least 1').max(20, 'Max cases cannot exceed 20'),
  currentCaseLoad: z.number().optional(),
});

// Address schema
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

// Image schema
export const imageSchema = z.object({
  url: z.string().url().optional(),
  key: z.string().optional(),
});

// Specializations
export const specializationSchema = z.enum([
  'marriage',
  'land',
  'property',
  'family',
  'divorce',
  'business',
  'employment',
  'neighbor',
  'inheritance',
  'other',
]);

// Create panelist schema
export const createPanelistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  age: z.number().min(21, 'Age must be at least 21').max(100, 'Age must be less than 100'),
  occupation: z.string().min(2, 'Occupation is required'),
  education: educationSchema,
  specializations: z
    .array(specializationSchema)
    .min(1, 'At least one specialization is required')
    .max(10, 'Maximum 10 specializations allowed'),
  experience: experienceSchema,
  contactInfo: contactInfoSchema,
  availability: z.object({
    maxCases: z.number().min(1, 'Max cases must be at least 1').max(20, 'Max cases cannot exceed 20'),
  }),
  address: addressSchema.optional(),
  bio: z.string().max(1000, 'Bio is too long').optional().refine(
    (val) => !val || val.length >= 20,
    { message: 'Bio must be at least 20 characters if provided' }
  ),
  certifications: z.array(z.string()).optional(),
  languages: z
    .array(z.string())
    .max(10, 'Maximum 10 languages allowed')
    .optional(),
  image: imageSchema.optional(),
});

// Update panelist schema (all fields optional)
export const updatePanelistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
  age: z.number().min(21, 'Age must be at least 21').max(100, 'Age must be less than 100').optional(),
  occupation: z.string().min(2, 'Occupation is required').optional(),
  education: educationSchema.optional(),
  specializations: z
    .array(specializationSchema)
    .min(1, 'At least one specialization is required')
    .max(10, 'Maximum 10 specializations allowed')
    .optional(),
  experience: experienceSchema.optional(),
  contactInfo: contactInfoSchema.optional(),
  availability: availabilitySchema.optional(),
  address: addressSchema.optional(),
  bio: z.string().max(1000, 'Bio is too long').optional().refine(
    (val) => !val || val.length >= 20,
    { message: 'Bio must be at least 20 characters if provided' }
  ),
  certifications: z.array(z.string()).optional(),
  languages: z
    .array(z.string())
    .max(10, 'Maximum 10 languages allowed')
    .optional(),
  image: imageSchema.optional(),
});

// Assign panel schema
export const assignPanelSchema = z.object({
  panelistIds: z
    .array(z.string())
    .min(1, 'At least one panelist must be selected')
    .max(5, 'Maximum 5 panelists can be assigned'),
});

// Export types
export type CreatePanelistInput = z.infer<typeof createPanelistSchema>;
export type UpdatePanelistInput = z.infer<typeof updatePanelistSchema>;
export type AssignPanelInput = z.infer<typeof assignPanelSchema>;
