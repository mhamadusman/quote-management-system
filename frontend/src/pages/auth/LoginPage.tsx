import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { LoginPayload } from '../../api/auth';
import { FormInput, PasswordInput, SubmitButton } from '../../components/common';
import { AuthCard } from '../../components/auth/AuthCard';

export interface LoginPageProps {}

export const LoginPage = (props: LoginPageProps) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginPayload) => {
    setServerError(null);
    try {
      await auth.login(data);
      navigate('/');
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: Array<{ message: string }> };
      setServerError(errorObj.errors?.[0]?.message || errorObj.message || 'Invalid email or password');
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your quote management workspace"
      serverError={serverError}
      footerText="Don't have an account?"
      footerLinkText="Create one now"
      footerLinkTo="/signup"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormInput
          label="Email address"
          placeholder="name@company.com"
          autoComplete="email"
          error={errors.email}
          registration={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Enter a valid email address',
            },
          })}
        />

        <PasswordInput
          label="Password"
          error={errors.password}
          registration={register('password', { required: 'Password is required' })}
        />

        <SubmitButton
          label="Sign in"
          loadingText="Signing in..."
          isLoading={isSubmitting}
          startIcon={<LockIcon sx={{ fontSize: '1rem' }} />}
        />
      </Box>
    </AuthCard>
  );
};
