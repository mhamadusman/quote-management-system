import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility,
  VisibilityOff,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import theme from './theme';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

const queryClient = new QueryClient();

interface DashboardShowcaseProps {}

const DashboardShowcase = (props: DashboardShowcaseProps) => {
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const activeUser = auth.user
    ? {
        name: auth.user.fullName,
        email: auth.user.email,
      }
    : {
        name: 'Alex Morgan',
        email: 'alex.m@thunes.com',
      };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={activeUser} onLogout={auth.logout} />
      <Box sx={{ flexGrow: 1, py: 4, px: 2, backgroundColor: 'background.default' }}>
        <Container maxWidth="md">
          {/* Header & Quick Navigation */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={700}>
                Fintech Workspace
              </Typography>
              <Typography variant="h2" sx={{ mt: 0.5, mb: 0.5 }}>
                Quote Management Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {auth.user ? `Logged in as ${auth.user.fullName} (${auth.user.email})` : 'Browse quotes, corridors, and manage cross-border pricing.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                startIcon={<LoginIcon sx={{ fontSize: '0.9rem' }} />}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button>
            </Box>
          </Box>

          {/* Form Inputs Component Demonstration */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Corridor Quotation Engine
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
              Defaulted in theme with compact 36px height, 13px font-size, 12px micro-placeholder, and 4px rounded corners.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Corridor Name"
                  placeholder="e.g. US to Nigeria (USD -> NGN)"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Settlement Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="NGN">NGN - Nigerian Naira</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Search Quotes"
                  placeholder="Search by quote ID, partner, or corridor..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="API Secret Key"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter API token or secret"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOff sx={{ fontSize: '1.1rem' }} />
                            ) : (
                              <Visibility sx={{ fontSize: '1.1rem' }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Action Buttons & Status Badges */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Corridor Status & Metrics Hierarchy
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 3 }}>
              <Button variant="contained" color="primary" startIcon={<SendIcon sx={{ fontSize: '1rem' }} />}>
                Create Quote
              </Button>
              <Button variant="outlined" color="primary">
                Edit Corridor
              </Button>
              <Button variant="contained" color="secondary">
                Secondary Action
              </Button>
              <Button variant="outlined" color="error">
                Reject Quote
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Quote Status Badges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Draft" sx={{ bgcolor: '#F1F5F9', color: '#475569' }} />
              <Chip label="In Review" sx={{ bgcolor: '#FEF3C7', color: '#B45309' }} />
              <Chip
                label="Approved"
                icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{ bgcolor: '#D1FAE5', color: '#047857' }}
              />
              <Chip label="Rejected" sx={{ bgcolor: '#FEE2E2', color: '#B91C1C' }} />
            </Box>
          </Paper>
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
              <Route path="/" element={<DashboardShowcase />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
