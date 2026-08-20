import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { PersonAddOutlined as SignupIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { SignupPayload } from '../../api/auth';
import { FormInput, PasswordInput, SubmitButton } from '../../components/common';
import { AuthCard } from '../../components/auth/AuthCard';
import { PasswordRules } from '../../components/auth/PasswordRules';

export interface SignupPageProps {}

export const SignupPage = (props: SignupPageProps) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupPayload>({
    defaultValues: { fullName: '', email: '', password: '', password_confirmation: '' },
    mode: 'onTouched',
  });

  const passwordValue = watch('password') || '';
  const isPasswordValid =
    passwordValue.length >= 8 &&
    /[a-z]/.test(passwordValue) &&
    /[A-Z]/.test(passwordValue) &&
    /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: SignupPayload) => {
    setServerError(null);
    if (!isPasswordValid) {
      setServerError('Please satisfy all password security requirements');
      return;
    }
    try {
      await auth.signup(data);
      navigate('/');
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: Array<{ message: string }> };
      setServerError(errorObj.errors?.[0]?.message || errorObj.message || 'Failed to create account.');
    }
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started with cross-border quote management"
      serverError={serverError}
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <FormInput
          label="Full name"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          error={errors.fullName}
          registration={register('fullName', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />

        <FormInput
          label="Work email"
          placeholder="alex@company.com"
          autoComplete="email"
          error={errors.email}
          registration={register('email', {
            required: 'Email is required',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email address' },
          })}
        />

        <Box>
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
            registration={register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <PasswordRules password={passwordValue} />
        </Box>

        <PasswordInput
          label="Confirm password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.password_confirmation}
          registration={register('password_confirmation', {
            required: 'Please confirm your password',
            validate: (val) => val === watch('password') || 'Passwords do not match',
          })}
        />

        <SubmitButton
          label="Create account"
          loadingText="Creating account..."
          isLoading={isSubmitting}
          startIcon={<SignupIcon sx={{ fontSize: '1rem' }} />}
        />
      </Box>
    </AuthCard>
  );
};
