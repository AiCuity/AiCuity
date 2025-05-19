
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Reader from "./pages/Reader";
import Calibration from "./pages/Calibration";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reader/:contentId" element={<Reader />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
