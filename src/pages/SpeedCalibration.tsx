
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SpeedCalibrationTool from "@/components/Calibration/SpeedCalibrationTool";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const SpeedCalibration = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  // Get current WPM from profile or localStorage
  const currentWpm = profile?.preferred_wpm || 
    parseInt(localStorage.getItem('preferred-wpm') || '300', 10);
  
  const handleCalibrationComplete = (wpm: number) => {
    toast({
      title: "Calibration Complete",
      description: `Your reading speed is now set to ${wpm} WPM.`,
    });
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Reading Speed Calibration</h1>
        </div>
        
        <div className="my-8">
          <SpeedCalibrationTool 
            onComplete={handleCalibrationComplete}
            defaultWpm={currentWpm}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeedCalibration;
