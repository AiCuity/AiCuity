
import { Button } from "@/components/ui/button";
import { Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface CalibrationButtonProps {
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const CalibrationButton = ({ 
  variant = "outline", 
  size = "default",
  className = ""
}: CalibrationButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={className}
            onClick={() => navigate("/speed-calibration")}
          >
            <Gauge className="h-4 w-4 mr-2" />
            Calibrate Reading Speed
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Find your optimal reading speed</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CalibrationButton;
