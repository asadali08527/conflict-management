import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { GoogleButton } from './GoogleButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, isLoading, switchAuthMode } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Google OAuth Button */} 
      <GoogleButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="auth-label">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

        {/* Forgot Password */}
        <div className="text-right">
          <Button
            type="button"
            variant="ghost"
            className="p-0 h-auto text-xs text-coral hover:text-coral-light hover:bg-transparent"
          >
            Forgot password?
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Button
          type="button"
          variant="ghost"
          className="p-0 h-auto text-coral hover:text-coral-light hover:bg-transparent font-medium"
          onClick={() => switchAuthMode('register')}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};