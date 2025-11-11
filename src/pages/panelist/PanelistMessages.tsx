import React from 'react';
import PanelistNavbar from '@/components/panelist/PanelistNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Clock } from 'lucide-react';

const PanelistMessages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PanelistNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        {/* Coming Soon Section */}
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-2xl w-full border-2 border-dashed border-gray-300">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-white" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Messages Coming Soon
              </h1>

              <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                Real-time communication features are currently under development.
                You'll be able to communicate with parties and administrators soon.
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Feature In Development
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PanelistMessages;
