import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  PlusCircle,
  User,
  LogOut,
  Bell,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientDashboardStats } from '@/hooks/client/useClientDashboard';

const ClientNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: dashboardStats } = useClientDashboardStats();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/client/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Cases',
      path: '/client/dashboard',
      icon: FileText,
    },
    {
      label: 'Meetings',
      path: '/client/meetings',
      icon: Calendar,
    },
    {
      label: 'Submit Case',
      path: '/submit-case',
      icon: PlusCircle,
    },
  ];

  const isActive = (path: string) => {
    // Special handling for My Cases - highlight when on dashboard OR viewing a specific case
    if (path === '/client/dashboard') {
      return location.pathname === '/client/dashboard' || location.pathname.startsWith('/client/cases/');
    }
    if (path === '/client/meetings') {
      return location.pathname.startsWith('/client/meetings');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get recent activity count for notification badge
  const recentActivityCount = dashboardStats?.overview?.recentActivityCount || 0;

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center justify-between gap-8">
            {/* Logo/Brand */}
            <div
              className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer flex-shrink-0"
              onClick={() => navigate('/client/dashboard')}
            >
              ResolvePeace
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1 flex-1 justify-center">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Button
                    key={item.path}
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 rounded-full transition-all ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Right Section - Notifications & User Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notifications Bell */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100/80 relative"
                onClick={() => navigate('/client/dashboard')}
              >
                <Bell size={18} />
                {recentActivityCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {recentActivityCount > 9 ? '9+' : recentActivityCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-gray-100/80 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                      <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {user?.firstName}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {dashboardStats?.overview && (
                    <>
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Total Cases</span>
                          <span className="font-medium">
                            {dashboardStats.overview.totalCases}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-600">Active Cases</span>
                          <span className="font-medium">
                            {dashboardStats.overview.openCases + dashboardStats.overview.inProgressCases}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={() => navigate('/client/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/client/dashboard')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Cases</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/client/meetings')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Meetings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit-case')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Submit New Case</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default ClientNavbar;
