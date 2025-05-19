
import React from 'react';
import { Button } from '@/components/ui/button';
import { GaugeCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CalibrationButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const CalibrationButton: React.FC<CalibrationButtonProps> = ({
  variant = "outline",
  size = "sm",
  className = "",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCalibrationClick = () => {
    if (!user) {
      toast.error("You need to be logged in to calibrate your reading speed");
      navigate("/login");
      return;
    }
    
    navigate("/calibration");
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`flex items-center gap-2 ${className}`}
      onClick={handleCalibrationClick}
    >
      <GaugeCircle className="h-4 w-4" />
      Calibration Test
    </Button>
  );
};

export default CalibrationButton;
