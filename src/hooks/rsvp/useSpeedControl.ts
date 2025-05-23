
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface SpeedControlOptions {
  setBaseWpm: (wpm: number) => void;
  showToasts: boolean;
}

export interface SpeedControlHook {
  handleWpmChange: (values: number[]) => void;
}

export function useSpeedControl({
  setBaseWpm,
  showToasts
}: SpeedControlOptions): SpeedControlHook {
  const { toast } = useToast();
  
  const handleWpmChange = useCallback((newWpm: number[]) => {
    // Extract the numeric value from the array
    const wpmValue = newWpm[0];
    console.log("handleWpmChange - Setting new WPM:", wpmValue);
    
    setBaseWpm(wpmValue);
    
    if (showToasts) {
      toast({
        title: "Reading Speed Updated",
        description: `Speed set to ${wpmValue} WPM.`,
      });
    }
  }, [setBaseWpm, showToasts, toast]);
  
  return { handleWpmChange };
}
