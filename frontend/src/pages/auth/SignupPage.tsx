import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { PersonAddOutlined as SignupIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { SignupPayload } from '../../types';
import { FormInput, PasswordInput, SubmitButton } from '../../components/common';
import { AuthCard } from '../../components/auth/AuthCard';
import { PasswordRules } from '../../components/auth/PasswordRules';
import { APP_ROUTES, AUTH_MESSAGES, VALIDATION_MESSAGES } from '../../constants';

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
      setServerError(AUTH_MESSAGES.SIGNUP.PASSWORD_UNSATISFIED);
      return;
    }
    try {
      const response = await auth.signup(data);
      navigate(APP_ROUTES.LOGIN, {
        state: { successMessage: response.message },
      });
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: Array<{ message: string }> };
      setServerError(errorObj.errors?.[0]?.message || errorObj.message || AUTH_MESSAGES.SIGNUP.DEFAULT_ERROR);
    }
  };

  return (
    <AuthCard
      title={AUTH_MESSAGES.SIGNUP.TITLE}
      subtitle={AUTH_MESSAGES.SIGNUP.SUBTITLE}
      serverError={serverError}
      footerText={AUTH_MESSAGES.SIGNUP.HAS_ACCOUNT}
      footerLinkText={AUTH_MESSAGES.SIGNUP.SIGN_IN}
      footerLinkTo={APP_ROUTES.LOGIN}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <FormInput
          label="Full name"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          error={errors.fullName}
          registration={register('fullName', {
            required: VALIDATION_MESSAGES.FULL_NAME_REQUIRED,
            minLength: { value: 2, message: VALIDATION_MESSAGES.FULL_NAME_MIN_LENGTH },
          })}
        />

        <FormInput
          label="Work email"
          placeholder="alex@company.com"
          autoComplete="email"
          error={errors.email}
          registration={register('email', {
            required: VALIDATION_MESSAGES.EMAIL_REQUIRED,
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: VALIDATION_MESSAGES.EMAIL_INVALID },
          })}
        />

        <Box>
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
            registration={register('password', {
              required: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
              minLength: { value: 8, message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH },
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
            required: VALIDATION_MESSAGES.PASSWORD_CONFIRMATION_REQUIRED,
            validate: (val) => val === watch('password') || VALIDATION_MESSAGES.PASSWORDS_MISMATCH,
          })}
        />

        <SubmitButton
          label={AUTH_MESSAGES.SIGNUP.BUTTON}
          loadingText={AUTH_MESSAGES.SIGNUP.BUTTON_LOADING}
          isLoading={isSubmitting}
          startIcon={<SignupIcon sx={{ fontSize: '1rem' }} />}
        />
      </Box>
    </AuthCard>
  );
};
