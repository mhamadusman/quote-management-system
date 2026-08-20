import { memo } from 'react';
import { Box, Typography, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { AuthCardProps } from '../../types';
import { BRANDING } from '../../constants';
import '../../styles/auth/auth.css';

const AuthCardComponent = (props: AuthCardProps) => {
  return (
    <Box className="auth-page-container">
      <div className="auth-circle-ring-top" />
      <div className="auth-circle-ring-bottom" />

      <Box className="auth-card">
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 1 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                color: '#0F172A',
                display: 'inline-flex',
                alignItems: 'baseline',
              }}
            >
              {BRANDING.NAME}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '6.5px',
                  height: '6.5px',
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  ml: '2px',
                }}
              />
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', mb: 0.5 }}>
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.subtitle}
          </Typography>
        </Box>

        {props.successMessage && (
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.78rem', py: 0.5, borderRadius: '4px' }}>
            {props.successMessage}
          </Alert>
        )}

        {props.serverError && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.78rem', py: 0.5, borderRadius: '4px' }}>
            {props.serverError}
          </Alert>
        )}

        {props.children}

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {props.footerText}{' '}
            <Link component={RouterLink} to={props.footerLinkTo} sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
              {props.footerLinkText}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export const AuthCard = memo(AuthCardComponent);
