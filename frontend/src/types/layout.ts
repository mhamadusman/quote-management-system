import type { ReactNode } from 'react';

export interface NavbarUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  user?: NavbarUser;
  onLogout?: () => void;
}

export interface FooterProps {
  appName?: string;
}

export interface AuthCardProps {
  title: string;
  subtitle: string;
  serverError?: string | null;
  successMessage?: string | null;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  children: ReactNode;
}

export interface PasswordRulesProps {
  password?: string;
}
