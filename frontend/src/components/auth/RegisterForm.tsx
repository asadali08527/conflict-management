import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone } from 'lucide-react';
import { useState } from 'react';
import { GoogleButton } from './GoogleButton';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading, switchAuthMode } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data.firstName, data.lastName, data.email, data.phone, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <GoogleButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">or create account with email</span>
        </div>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* First Name Field */}
        <div className="space-y-1">
          <Label htmlFor="firstName" className="auth-label">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              className="auth-input pl-11"
              {...register('firstName')}
            />
          </div>
          {errors.firstName && (
            <p className="text-red-600 text-xs">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="space-y-1">
          <Label htmlFor="lastName" className="auth-label">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="auth-input pl-11"
              {...register('lastName')}
            />
          </div>
          {errors.lastName && (
            <p className="text-red-600 text-xs">{errors.lastName.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <Label htmlFor="email" className="auth-label">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="auth-input pl-11"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1">
          <Label htmlFor="phone" className="auth-label">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="9696253929"
              className="auth-input pl-11"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-red-600 text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <Label htmlFor="password" className="auth-label">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="auth-input pl-11 pr-11"
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="auth-label">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="auth-input pl-11 pr-11"
              {...register('confirmPassword')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Button
            type="button"
            variant="ghost"
            className="p-0 h-auto text-coral hover:text-coral-light hover:bg-transparent underline"
          >
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button
            type="button"
            variant="ghost"
            className="p-0 h-auto text-coral hover:text-coral-light hover:bg-transparent underline"
          >
            Privacy Policy
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full auth-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Button
          type="button"
          variant="ghost"
          className="p-0 h-auto text-coral hover:text-coral-light hover:bg-transparent font-medium"
          onClick={() => switchAuthMode('login')}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};