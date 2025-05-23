
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SmartPacingOptions {
  smartPacingEnabled: boolean;
  setSmartPacingEnabled: (enabled: boolean) => void;
  showToasts: boolean;
}

export interface SmartPacingControls {
  toggleSmartPacing: () => void;
}

export function useSmartPacing({
  smartPacingEnabled,
  setSmartPacingEnabled,
  showToasts
}: SmartPacingOptions): SmartPacingControls {
  const { toast } = useToast();
  
  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('smart-pacing', smartPacingEnabled.toString());
  }, [smartPacingEnabled]);
  
  const toggleSmartPacing = useCallback(() => {
    const newValue = !smartPacingEnabled;
    setSmartPacingEnabled(newValue);
    if (showToasts) {
      toast({
        title: newValue ? "Smart Pacing Enabled" : "Smart Pacing Disabled",
        description: newValue 
          ? "Reading speed will adjust based on complexity." 
          : "Reading at constant speed.",
      });
    }
  }, [smartPacingEnabled, setSmartPacingEnabled, showToasts, toast]);
  
  return { toggleSmartPacing };
}
