import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, phone: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  switchAuthMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });

      if (response.status === 'success' && response.data) {
        const user: User = {
          ...response.data.user,
          provider: 'email'
        };

        setUser(user);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(user));
        setIsAuthModalOpen(false);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, phone: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password
      });

      if (response.status === 'success' && response.data) {
        const user: User = {
          ...response.data.user,
          provider: 'email'
        };

        setUser(user);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(user));
        setIsAuthModalOpen(false);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Send the Google ID token to our backend
      const response = await authService.googleLogin(idToken);
      
      if (response.status === 'success' && response.data) {
        const user: User = {
          ...response.data.user,
          provider: 'google'
        };

        setUser(user);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(user));
        setIsAuthModalOpen(false);
      } else {
        throw new Error('Google login failed');
      }
    } catch (error) {
      throw new Error('Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_token');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const switchAuthMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user_info');
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAuthModalOpen,
    authMode,
    login,
    register,
    loginWithGoogle,
    logout,
    openAuthModal,
    closeAuthModal,
    switchAuthMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};