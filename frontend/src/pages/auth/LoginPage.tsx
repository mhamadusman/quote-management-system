import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import type { LoginPayload, User } from '../../types';
import { FormInput, PasswordInput, SubmitButton } from '../../components/common';
import { AuthCard } from '../../components/auth/AuthCard';
import { APP_ROUTES, AUTH_MESSAGES, VALIDATION_MESSAGES } from '../../constants';
import { handleApiSuccess, handleApiError } from '../../utils';

export interface LoginPageProps {}

export const LoginPage = (props: LoginPageProps) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      const res = await AuthService.login(data);
      const raw = res.data as Record<string, unknown> | null;
      const userData = raw && 'user' in raw ? (raw.user as User) : (raw as unknown as User);
      auth.setUser(userData);
      queryClient.setQueryData(['currentUser'], userData);
      handleApiSuccess(res.message || 'Logged in successfully');
      navigate(APP_ROUTES.HOME);
    } catch (err: unknown) {
      handleApiError(err, setError, AUTH_MESSAGES.LOGIN.DEFAULT_ERROR);
    }
  };

  return (
    <AuthCard
      title={AUTH_MESSAGES.LOGIN.TITLE}
      subtitle={AUTH_MESSAGES.LOGIN.SUBTITLE}
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

