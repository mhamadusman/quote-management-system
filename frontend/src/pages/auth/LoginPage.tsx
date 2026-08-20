import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { LoginPayload } from '../../types';
import { FormInput, PasswordInput, SubmitButton } from '../../components/common';
import { AuthCard } from '../../components/auth/AuthCard';
import { APP_ROUTES, AUTH_MESSAGES, VALIDATION_MESSAGES } from '../../constants';

export interface LoginPageProps {}

export const LoginPage = (props: LoginPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const successMessage = (location.state as { successMessage?: string })?.successMessage || null;

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
      navigate(APP_ROUTES.HOME);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: Array<{ message: string }> };
      setServerError(errorObj.errors?.[0]?.message || errorObj.message || AUTH_MESSAGES.LOGIN.DEFAULT_ERROR);
    }
  };

  return (
    <AuthCard
      title={AUTH_MESSAGES.LOGIN.TITLE}
      subtitle={AUTH_MESSAGES.LOGIN.SUBTITLE}
      serverError={serverError}
      successMessage={successMessage}
      footerText={AUTH_MESSAGES.LOGIN.NO_ACCOUNT}
      footerLinkText={AUTH_MESSAGES.LOGIN.CREATE_ACCOUNT}
      footerLinkTo={APP_ROUTES.SIGNUP}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormInput
          label="Email address"
          placeholder="name@company.com"
          autoComplete="email"
          error={errors.email}
          registration={register('email', {
            required: VALIDATION_MESSAGES.EMAIL_REQUIRED,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: VALIDATION_MESSAGES.EMAIL_INVALID,
            },
          })}
        />

        <PasswordInput
          label="Password"
          error={errors.password}
          registration={register('password', { required: VALIDATION_MESSAGES.PASSWORD_REQUIRED })}
        />

        <SubmitButton
          label={AUTH_MESSAGES.LOGIN.BUTTON}
          loadingText={AUTH_MESSAGES.LOGIN.BUTTON_LOADING}
          isLoading={isSubmitting}
          startIcon={<LockIcon sx={{ fontSize: '1rem' }} />}
        />
      </Box>
    </AuthCard>
  );
};
