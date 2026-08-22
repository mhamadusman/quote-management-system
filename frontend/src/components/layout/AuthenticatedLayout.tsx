import { useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { handleApiError, handleApiSuccess } from '../../utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { AuthService } from '../../api/auth';
import { APP_ROUTES } from '../../constants';

export const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError, error } = useCurrentUser();

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, undefined, 'Session expired. Please log in again.');
    }
  }, [isError, error]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      handleApiSuccess('Logged out successfully');
    } catch {
      // Continue cleanup on logout error
    } finally {
      queryClient.cancelQueries()
      queryClient.setQueryData(['currentUser'], null);
      navigate(APP_ROUTES.LOGIN);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <LoadingIndicator size={40} />
      </Box>
    );
  }

  if (isError || !user) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  const activeUser = {
    name: user.fullName,
    email: user.email,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Navbar user={activeUser} onLogout={handleLogout} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet context={{ user }} />
      </Box>
      <Footer />
    </Box>
  );
};
