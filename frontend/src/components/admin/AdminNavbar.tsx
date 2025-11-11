import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, FileText, Users, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logout } = useAdminAuth();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Cases',
      path: '/admin/cases',
      icon: FileText,
    },
    {
      label: 'Panelists',
      path: '/admin/panelists',
      icon: Users,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/cases') {
      return location.pathname.startsWith('/admin/cases');
    }
    if (path === '/admin/panelists') {
      return location.pathname.startsWith('/admin/panelists');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg px-6 py-3">
          <div className="flex items-center justify-between gap-8">
            {/* Logo/Brand */}
            <div
              className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer flex-shrink-0"
              onClick={() => navigate('/admin/dashboard')}
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
                      {adminUser?.firstName?.[0]}
                      {adminUser?.lastName?.[0]}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-gray-700">
                      {adminUser?.firstName}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white ">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {adminUser?.firstName} {adminUser?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/panelists')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Panelists</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminNavbar;
