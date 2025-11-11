import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Home, FileText, Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface InternalHeaderProps {
  showNotifications?: boolean;
}

const InternalHeader = ({ showNotifications = true }: InternalHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const dummyNotifications = [
    {
      id: 1,
      type: "case_update",
      title: "Case Status Update",
      message: "Your case CM-2024-001 has been assigned to Dr. Emily Chen",
      timestamp: "5 minutes ago",
      icon: CheckCircle,
      read: false,
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "Mediator has requested additional documentation for your case",
      timestamp: "2 hours ago",
      icon: MessageSquare,
      read: false,
    },
    {
      id: 3,
      type: "deadline",
      title: "Deadline Reminder",
      message: "Response deadline for case CM-2024-002 is tomorrow",
      timestamp: "1 day ago",
      icon: Clock,
      read: false,
    },
    {
      id: 4,
      type: "case_update",
      title: "Mediation Scheduled",
      message: "Your mediation session is scheduled for December 15th at 2:00 PM",
      timestamp: "2 days ago",
      icon: CheckCircle,
      read: true,
    },
    {
      id: 5,
      type: "alert",
      title: "Document Required",
      message: "Please upload the requested contract documents",
      timestamp: "3 days ago",
      icon: AlertCircle,
      read: true,
    },
  ];

  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/client/dashboard",
      icon: Home,
    },
    {
      label: "My Cases",
      path: "/client/dashboard",
      icon: FileText,
    },
    {
      label: "Submit Case",
      path: "/submit-case",
      icon: Plus,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div
              className="text-2xl font-bold text-primary cursor-pointer"
              onClick={() => navigate('/')}
            >
              ResolvePeace
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showNotifications && (
              <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell size={20} />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount} new
                        </Badge>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-1">
                      {dummyNotifications.map((notification, index) => {
                        const Icon = notification.icon;
                        return (
                          <div key={notification.id}>
                            <div className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50 border border-blue-100' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                  <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {notification.timestamp}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {index < dummyNotifications.length - 1 && <Separator className="my-1" />}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotificationOpen(false)}
                    >
                      Mark All as Read
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-primary/20"
                    />
                  )}
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-foreground">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default InternalHeader;