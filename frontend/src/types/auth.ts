export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => Promise<void>;
}
