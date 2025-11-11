import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePanelistAuth } from '@/contexts/PanelistAuthContext';
import { usePanelistAuthQuery } from '@/hooks/panelist/usePanelistAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
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

const PanelistNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { panelistUser, panelistInfo } = usePanelistAuth();
  const { logoutMutation } = usePanelistAuthQuery();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/panelist/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Cases',
      path: '/panelist/cases',
      icon: FileText,
    },
    {
      label: 'Meetings',
      path: '/panelist/meetings',
      icon: Calendar,
    },
    {
      label: 'Messages',
      path: '/panelist/messages',
      icon: MessageSquare,
    },
    {
      label: 'Profile',
      path: '/panelist/profile',
      icon: User,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/panelist/cases') {
      return location.pathname.startsWith('/panelist/cases');
    }
    if (path === '/panelist/meetings') {
      return location.pathname.startsWith('/panelist/meetings');
    }
    if (path === '/panelist/messages') {
      return location.pathname.startsWith('/panelist/messages');
    }
    if (path === '/panelist/profile') {
      return location.pathname.startsWith('/panelist/profile');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/panelist/login');
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center justify-between gap-8">
            {/* Logo/Brand */}
            <div
              className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer flex-shrink-0"
              onClick={() => navigate('/panelist/dashboard')}
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
                    className={`flex items-center gap-2 rounded-full transition-all relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
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
              >
                <Bell size={18} />
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
                        {panelistUser?.firstName?.[0]}
                        {panelistUser?.lastName?.[0]}
                      </div>
                      <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {panelistUser?.firstName}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {panelistUser?.firstName} {panelistUser?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {panelistUser?.email}
                      </p>
                      {panelistInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {panelistInfo.occupation}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {panelistInfo && (
                    <>
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Case Load</span>
                          <span className="font-medium">
                            {panelistInfo.availability.currentCaseLoad} / {panelistInfo.availability.maxCases}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{
                              width: `${(panelistInfo.availability.currentCaseLoad / panelistInfo.availability.maxCases) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={() => navigate('/panelist/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/panelist/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/panelist/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
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

export default PanelistNavbar;
