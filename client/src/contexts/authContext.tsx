import React, { useEffect, useState, createContext, useContext } from 'react';
import { auth } from '../api/api-auth.ts';
import { authHelper } from '../api/auth-helper.ts';
import { ApiResponse, User, } from '../api/types.ts';

export interface AuthResponse {
  success: boolean;
  message?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (user: User, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
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
      const checkAuth = () => {
        try {
          const storedUser = localStorage.getItem('user');
          const jwttoken = authHelper.getJWT();
          if (storedUser && jwttoken) {
            const parsedUser = JSON.parse(storedUser) as User;
            if (parsedUser && parsedUser.name && parsedUser.id) {
              setUser(parsedUser);
            } else {
              console.warn('Incomplete user data, clearing...');
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('user');
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, []);

    const signUp = async (user: User, password: string): Promise<ApiResponse> => {
      setLoading(true);
      const authResponse: ApiResponse = { success: false };
      try {
        const response = await auth.signup(user, password);

        if (response && response.success && response.data) {
          const createdUser = response.data?.user as User;
          setUser(createdUser);
          localStorage.setItem('user', JSON.stringify(createdUser));
          authHelper.authenticate(response.data?.token);
          authResponse.success = true;
        } else {
          authResponse.success = false;
          authResponse.message = response.message || 'Sign up failed';
        }
      } catch (error) {
        console.error('Error during sign up:', error);
      } finally {
        setLoading(false);
      }
      return authResponse;
    };
    const login = async (email: string, password: string): Promise<AuthResponse> => {
      setLoading(true);
      const authResponse: AuthResponse = { success: false };
      try {
        const response = await auth.signin(email, password);
        if (response && response.data && response.success) {
          authHelper.authenticate(response.data.token);
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          authResponse.success = true;
        } else {
          authResponse.success = false;
          authResponse.message = response.message || 'Login failed';
        }
      } catch (error) {
        console.error('Error logging in:', error);
      } finally {
        setLoading(false);
      }
      return authResponse;
    };
    const logout = () => {
      setUser(null);
      authHelper.clearJWT();
      localStorage.removeItem('user');
    };

    const googleLogin = (token: string, onLoginSuccess: () => void) => {
      setLoading(true);
      auth.googleAuthLogin(token).then((response: any) => {
        if (response.error) {
          setLoading(false);
        } else {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          // authHelper.authenticate(response.data.token, onLoginSuccess);
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
      signUp,
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