import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../api/auth';
import type { User, LoginPayload, SignupPayload, ApiResponse } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<ApiResponse<User>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const normalizeUserData = (data: unknown): User | null => {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (obj.user && typeof obj.user === 'object') {
    return obj.user as User;
  }
  return obj as unknown as User;
};

export const AuthProvider = (props: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.getProfile();
        setUser(normalizeUserData(res.data));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    try {
      const res = await AuthService.login(payload);
      const userData = normalizeUserData(res.data) as User;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (payload: SignupPayload): Promise<ApiResponse<User>> => {
    try {
      const res = await AuthService.signup(payload);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch {
      // Continue cleanup on logout error
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
