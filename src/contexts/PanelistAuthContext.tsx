import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PanelistUser, PanelistInfo } from '@/types/panelist/auth.types';

interface PanelistAuthContextType {
  panelistUser: PanelistUser | null;
  panelistInfo: PanelistInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: PanelistUser, panelist: PanelistInfo, token: string) => void;
  logout: () => void;
  updatePanelistInfo: (panelist: PanelistInfo) => void;
}

const PanelistAuthContext = createContext<PanelistAuthContextType | undefined>(undefined);

export const PanelistAuthProvider = ({ children }: { children: ReactNode }) => {
  const [panelistUser, setPanelistUser] = useState<PanelistUser | null>(null);
  const [panelistInfo, setPanelistInfo] = useState<PanelistInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedToken = localStorage.getItem('panelistAuthToken');
    const storedUser = localStorage.getItem('panelistUser');
    const storedPanelist = localStorage.getItem('panelistInfo');

    if (storedToken && storedUser && storedPanelist) {
      try {
        setToken(storedToken);
        setPanelistUser(JSON.parse(storedUser));
        setPanelistInfo(JSON.parse(storedPanelist));
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('panelistAuthToken');
        localStorage.removeItem('panelistUser');
        localStorage.removeItem('panelistInfo');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: PanelistUser, panelist: PanelistInfo, authToken: string) => {
    setToken(authToken);
    setPanelistUser(user);
    setPanelistInfo(panelist);
    localStorage.setItem('panelistAuthToken', authToken);
    localStorage.setItem('panelistUser', JSON.stringify(user));
    localStorage.setItem('panelistInfo', JSON.stringify(panelist));
  };

  const logout = () => {
    setToken(null);
    setPanelistUser(null);
    setPanelistInfo(null);
    localStorage.removeItem('panelistAuthToken');
    localStorage.removeItem('panelistUser');
    localStorage.removeItem('panelistInfo');
  };

  const updatePanelistInfo = (panelist: PanelistInfo) => {
    setPanelistInfo(panelist);
    localStorage.setItem('panelistInfo', JSON.stringify(panelist));
  };

  const value = {
    panelistUser,
    panelistInfo,
    token,
    isAuthenticated: !!token && !!panelistUser,
    isLoading,
    login,
    logout,
    updatePanelistInfo,
  };

  return (
    <PanelistAuthContext.Provider value={value}>
      {children}
    </PanelistAuthContext.Provider>
  );
};

export const usePanelistAuth = () => {
  const context = useContext(PanelistAuthContext);
  if (context === undefined) {
    throw new Error('usePanelistAuth must be used within a PanelistAuthProvider');
  }
  return context;
};
