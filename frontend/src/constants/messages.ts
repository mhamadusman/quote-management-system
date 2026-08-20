export const AUTH_MESSAGES = {
  LOGIN: {
    TITLE: 'Welcome back',
    SUBTITLE: 'Sign in to your quote management workspace',
    BUTTON: 'Sign in',
    BUTTON_LOADING: 'Signing in...',
    NO_ACCOUNT: "Don't have an account?",
    CREATE_ACCOUNT: 'Create one now',
    DEFAULT_ERROR: 'Invalid email or password',
  },
  SIGNUP: {
    TITLE: 'Create an account',
    SUBTITLE: 'Get started with cross-border quote management',
    BUTTON: 'Create account',
    BUTTON_LOADING: 'Creating account...',
    HAS_ACCOUNT: 'Already have an account?',
    SIGN_IN: 'Sign in',
    PASSWORD_UNSATISFIED: 'Please satisfy all password security requirements',
    DEFAULT_ERROR: 'Failed to create account. Please try again.',
  },
} as const;

export const VALIDATION_MESSAGES = {
  FULL_NAME_REQUIRED: 'Full name is required',
  FULL_NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_CONFIRMATION_REQUIRED: 'Please confirm your password',
  PASSWORDS_MISMATCH: 'Passwords do not match',
} as const;

export const PASSWORD_RULES_LABELS = {
  MIN_LENGTH: '8+ characters',
  LOWERCASE: '1 lowercase (a-z)',
  UPPERCASE: '1 uppercase (A-Z)',
  SPECIAL_CHAR: '1 symbol (!@#$)',
} as const;
