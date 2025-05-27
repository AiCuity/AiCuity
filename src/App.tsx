import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Register from './pages/Register';
import Calibration from './pages/Calibration';
import SpeedCalibration from './pages/SpeedCalibration';
import CalibratePage from './pages/Calibrate';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/context/AuthContext';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/reader/:contentId?" element={<Reader />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/speed-calibration" element={<SpeedCalibration />} />
            <Route path="/calibrate" element={<CalibratePage />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster position="bottom-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
