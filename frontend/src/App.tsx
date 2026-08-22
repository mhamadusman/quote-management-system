import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { Dashboard } from './components/dashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { APP_ROUTES } from './constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProps {}

export const App = (props: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick={true}
              pauseOnHover={true}
              pauseOnFocusLoss={false}
              draggable={false}
              theme="colored"
            />
            <Routes>
              {/* Public Routes */}
              <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={APP_ROUTES.SIGNUP} element={<SignupPage />} />

              {/* Protected Routes inside AuthenticatedLayout */}
              <Route element={<AuthenticatedLayout />}>
                <Route path={APP_ROUTES.HOME} element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to={APP_ROUTES.LOGIN} replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
