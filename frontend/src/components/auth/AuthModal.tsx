import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authMode, closeAuthModal } = useAuth();

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="modal-container max-w-md w-full mx-4 p-0 border-0 shadow-2xl bg-white overflow-hidden">
        {/* Solid white container */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Content */}
          <div className="relative z-10 p-8 pt-12 pb-8 overflow-y-auto max-h-[90vh] scrollbar-hide">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-coral to-mint mb-4">
                <div className="text-2xl font-bold text-white">
                  RP
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Join ResolvePeace'}
              </h1>
              <p className="text-gray-600 text-sm">
                {authMode === 'login'
                  ? 'Sign in to continue your journey'
                  : 'Start resolving conflicts peacefully'
                }
              </p>
            </div>

            {/* Forms */}
            {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};