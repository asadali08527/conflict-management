import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePanelistAuth } from '@/contexts/PanelistAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedPanelistRouteProps {
  children: React.ReactNode;
}

export const ProtectedPanelistRoute: React.FC<ProtectedPanelistRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = usePanelistAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/panelist/login" replace />;
  }

  return <>{children}</>;
};
