import React, { useEffect, useState, createContext, useContext } from 'react';
import { auth } from '../api/api-auth.ts';
import { authHelper } from '../api/auth-helper.ts';
interface User {
  id: string;
  name: string;
  email: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  googleLogin?: (token: string, onLoginSuccess: () => void) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Check if user is already logged in
    useEffect(() => {
      const checkAuth = async () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      };
      checkAuth();
    }, []);
    const login = async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      // Simulate API call with a delay
      return new Promise(resolve => {
        setTimeout(() => {
          // Mock authentication - in a real app, this would be an API call
          if (email && password) {
            // For demo purposes, any non-empty email/password works
            const user = {
              id: '1',
              name: email.split('@')[0],
              email
            };
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            setLoading(false);
            resolve(true);
          } else {
            setLoading(false);
            resolve(false);
          }
        }, 1000);
      });
    };
    const logout = () => {
      setUser(null);
      authHelper.clearJWT();
      localStorage.removeItem('user');
    };

    const googleLogin = (token: string, onLoginSuccess: () => void) => {
      setLoading(true);
      auth.googleAuthLogin(token).then((data: any) => {
        if (data.error) {
          setLoading(false);
        } else {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          authHelper.authenticate(data.token, onLoginSuccess);
        }
        setLoading(false);
      });
    };
    const value = {
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      googleLogin,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};