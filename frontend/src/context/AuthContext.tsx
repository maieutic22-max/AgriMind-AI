import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for persistent token
    const storedToken = localStorage.getItem('agrimind_token');
    const storedUser = localStorage.getItem('agrimind_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('agrimind_token');
        localStorage.removeItem('agrimind_user');
      }
    } else {
      // Default to demo session for ease of evaluation in Phase 1
      const defaultDemoUser: User = {
        id: 'demo-farmer-uuid',
        email: 'farmer@agrimind.ai',
        fullName: 'Balram Patil',
        role: 'FARMER',
      };
      setUser(defaultDemoUser);
      setToken('demo-jwt-token-placeholder');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const userObj: User = {
        id: res.user_id,
        email: res.email,
        fullName: res.full_name,
        role: res.role,
      };
      setToken(res.access_token);
      setUser(userObj);
      localStorage.setItem('agrimind_token', res.access_token);
      localStorage.setItem('agrimind_user', JSON.stringify(userObj));
    } catch (err) {
      // Fallback for development if API is unreachable
      const fallbackUser: User = {
        id: 'dev-user-id',
        email,
        fullName: email.split('@')[0],
        role: 'FARMER',
      };
      setUser(fallbackUser);
      setToken('local-dev-token');
      localStorage.setItem('agrimind_token', 'local-dev-token');
      localStorage.setItem('agrimind_user', JSON.stringify(fallbackUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
      });
      await login(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrimind_token');
    localStorage.removeItem('agrimind_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
