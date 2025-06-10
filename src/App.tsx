import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import Reader from './pages/Reader';
import GlassesReader from './pages/GlassesReader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Calibration from './pages/Calibration';
import SpeedCalibration from './pages/SpeedCalibration';
import CalibratePage from './pages/Calibrate';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/context/AuthContext';

// Create a query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/reader/:contentId?" element={<Reader />} />
              <Route path="/reader/glasses/:contentId" element={<GlassesReader />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/calibration" element={<Calibration />} />
              <Route path="/speed-calibration" element={<SpeedCalibration />} />
              <Route path="/calibrate" element={<CalibratePage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="bottom-right" />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
