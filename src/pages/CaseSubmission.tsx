import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CaseSubmissionForm } from '@/components/case-submission/CaseSubmissionForm';
import InternalHeader from '@/components/InternalHeader';

const CaseSubmission = () => {
  const { user } = useAuth();

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-mint/20">
      <InternalHeader showNotifications={false} />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Submit Your Case
            </h1>
            <p className="text-gray-600">
              Help us understand your conflict so we can provide the best
              mediation service
            </p>
          </div>

          <CaseSubmissionForm />
        </div>
      </div>
    </div>
  );
};

export default CaseSubmission;
