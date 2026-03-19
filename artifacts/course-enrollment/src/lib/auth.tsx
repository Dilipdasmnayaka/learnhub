import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCurrentUser } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const { data: fetchedUser, isLoading: isFetchingUser, isError } = useGetCurrentUser({
    request: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  });

  // If token changes, update localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Sync fetched user
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  // Handle fetch error (e.g. invalid token)
  useEffect(() => {
    if (isError) {
      setToken(null);
      setUser(null);
    }
  }, [isError]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isLoading = (!!token && !user && isFetchingUser);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper for other hooks to get headers
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
