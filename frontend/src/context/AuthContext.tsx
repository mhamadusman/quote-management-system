import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../api/auth';
import type { User, LoginPayload, SignupPayload } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.getProfile();
        setUser(res.data);
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
      setUser(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (payload: SignupPayload): Promise<User> => {
    try {
      const res = await AuthService.signup(payload);
      setUser(res.data);
      return res.data;
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
