import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { openAuthModal, user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
      <nav className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-foreground">ResolvePeace</div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#mediators"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Our Team
            </a>
            <a
              href="/admin/login"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Admin Login
            </a>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/client/dashboard')}
              >
                My Cases
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/submit-case')}
              >
                Submit Case
              </Button>
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-primary/20"
                  />
                )}
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => openAuthModal('register')}
              >
                Start Free Consultation
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
