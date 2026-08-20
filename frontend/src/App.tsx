import { BrowserRouter, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import { Login as LoginIcon, PersonAddOutlined as SignupIcon } from '@mui/icons-material';
import theme from './theme';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { APP_ROUTES } from './constants';

const queryClient = new QueryClient();

interface DashboardProps {}

const Dashboard = (props: DashboardProps) => {
  const auth = useAuth();

  const activeUser = auth.user
    ? {
        name: auth.user.fullName,
        email: auth.user.email,
      }
    : undefined;

  const displayName = auth.user ? auth.user.fullName : 'Guest';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={activeUser} onLogout={auth.logout} />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          px: 2,
          py: 8,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mt: 1,
              mb: 1.5,
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Hello, {displayName}!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {auth.user
              ? `Welcome to your Thunes quote management platform.`
              : `Please sign in or create an account to manage your quotes and corridors.`}
          </Typography>

          {!auth.user && (
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
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

interface AppProps {}

export const App = (props: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path={APP_ROUTES.HOME} element={<Dashboard />} />
              <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={APP_ROUTES.SIGNUP} element={<SignupPage />} />
              <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
