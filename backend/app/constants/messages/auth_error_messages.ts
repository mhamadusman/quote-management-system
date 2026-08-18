export const AuthErrorMessages = {
  SIGNUP: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    EMAIL_TAKEN: 'An account with this email already exists',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
    PASSWORD_LOWERCASE: 'Password must include at least one lowercase letter',
    PASSWORD_UPPERCASE: 'Password must include at least one uppercase letter',
    PASSWORD_SPECIAL: 'Password must include at least one special character',
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
