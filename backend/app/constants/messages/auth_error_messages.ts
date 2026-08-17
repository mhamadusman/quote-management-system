// app/constants/messages/auth_error_messages.ts
export const AuthErrorMessages = {
  SIGNUP: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    EMAIL_TAKEN: 'An account with this email already exists',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_WEAK:
      'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a special character',
    PASSWORD_CONFIRMATION_REQUIRED: 'Please confirm your password',
    PASSWORD_MISMATCH: 'Passwords do not match',
  },
  LOGIN: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    INVALID_CREDENTIALS: 'Invalid email or password',
  },
} as const