import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Login as LoginIcon, PersonAddOutlined as SignupIcon } from '@mui/icons-material';
import { APP_ROUTES } from '../../constants';

export interface GuestLandingProps {}

const GuestLandingComponent = (props: GuestLandingProps) => {
  return (
    <Box sx={{ textAlign: 'center', py: 8, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
        Thunes Remittance Platform
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mt: 1, mb: 1.5 }}>
        Hello, Guest!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to your account to view quotes, manage pricing corridors, and generate cross-border contracts.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
        <Button
          component={RouterLink}
          to={APP_ROUTES.LOGIN}
          variant="outlined"
          startIcon={<LoginIcon sx={{ fontSize: '0.95rem' }} />}
        >
          Sign in
        </Button>
        <Button
          component={RouterLink}
          to={APP_ROUTES.SIGNUP}
          variant="contained"
          color="primary"
          startIcon={<SignupIcon sx={{ fontSize: '0.95rem' }} />}
        >
          Create account
        </Button>
      </Box>
    </Box>
  );
};

export const GuestLanding = memo(GuestLandingComponent);
