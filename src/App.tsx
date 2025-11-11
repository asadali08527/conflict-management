import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { PanelistAuthProvider } from '@/contexts/PanelistAuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';
import { ProtectedPanelistRoute } from '@/components/panelist/ProtectedPanelistRoute';
import { ProtectedClientRoute } from '@/components/client/ProtectedClientRoute';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import CaseSubmission from './pages/CaseSubmission';
import AdminWork from './pages/AdminWork';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCaseDetail from './pages/admin/AdminCaseDetail';
import PanelistList from './pages/admin/PanelistList';
import PanelistDetail from './pages/admin/PanelistDetail';
import PanelistForm from './pages/admin/PanelistForm';
import PanelistLogin from './pages/panelist/PanelistLogin';
import PanelistDashboard from './pages/panelist/PanelistDashboard';
import PanelistCases from './pages/panelist/PanelistCases';
import PanelistCaseDetail from './pages/panelist/PanelistCaseDetail';
import PanelistMeetings from './pages/panelist/PanelistMeetings';
import PanelistMessages from './pages/panelist/PanelistMessages';
import PanelistProfile from './pages/panelist/PanelistProfile';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientCaseDetail from './pages/client/ClientCaseDetail';
import ClientMeetings from './pages/client/ClientMeetings';
import ClientMeetingDetail from './pages/client/ClientMeetingDetail';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <PanelistAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/submit-case" element={<CaseSubmission />} />
                {/* <Route path="/admin-work" element={<AdminWork />} /> */}

                {/* Client Portal Routes */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedClientRoute>
                      <ClientDashboard />
                    </ProtectedClientRoute>
                  }
                />
                <Route
                  path="/client/cases/:caseId"
                  element={
                    <ProtectedClientRoute>
                      <ClientCaseDetail />
                    </ProtectedClientRoute>
                  }
                />
                <Route
                  path="/client/meetings"
                  element={
                    <ProtectedClientRoute>
                      <ClientMeetings />
                    </ProtectedClientRoute>
                  }
                />
                <Route
                  path="/client/meetings/:meetingId"
                  element={
                    <ProtectedClientRoute>
                      <ClientMeetingDetail />
                    </ProtectedClientRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/cases/:id"
                  element={
                    <ProtectedAdminRoute>
                      <AdminCaseDetail />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Admin Panelist Management Routes */}
                <Route
                  path="/admin/panelists"
                  element={
                    <ProtectedAdminRoute>
                      <PanelistList />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/panelists/new"
                  element={
                    <ProtectedAdminRoute>
                      <PanelistForm />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/panelists/:id"
                  element={
                    <ProtectedAdminRoute>
                      <PanelistDetail />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/panelists/:id/edit"
                  element={
                    <ProtectedAdminRoute>
                      <PanelistForm />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Panelist Portal Routes */}
                <Route path="/panelist/login" element={<PanelistLogin />} />
                <Route
                  path="/panelist/dashboard"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistDashboard />
                    </ProtectedPanelistRoute>
                  }
                />
                <Route
                  path="/panelist/cases"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistCases />
                    </ProtectedPanelistRoute>
                  }
                />
                <Route
                  path="/panelist/cases/:caseId"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistCaseDetail />
                    </ProtectedPanelistRoute>
                  }
                />
                <Route
                  path="/panelist/meetings"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistMeetings />
                    </ProtectedPanelistRoute>
                  }
                />
                <Route
                  path="/panelist/messages"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistMessages />
                    </ProtectedPanelistRoute>
                  }
                />
                <Route
                  path="/panelist/profile"
                  element={
                    <ProtectedPanelistRoute>
                      <PanelistProfile />
                    </ProtectedPanelistRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AuthModal />
          </TooltipProvider>
        </PanelistAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
