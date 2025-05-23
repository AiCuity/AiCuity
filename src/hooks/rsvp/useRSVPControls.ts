
import { useCallback, useMemo } from "react";
import { calculateDelay, calculateComplexity } from "@/utils/rsvp-timing";
import { formatWord } from "@/utils/rsvp-word-utils";
import { useToast } from "@/hooks/use-toast";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

export function useRSVPControls({
  words,
  currentWordIndex,
  setCurrentWordIndex,
  isPlaying,
  setIsPlaying,
  baseWpm,
  setBaseWpm,
  smartPacingEnabled,
  setSmartPacingEnabled,
  showToasts
}) {
  const { toast } = useToast();
  
  // Format the current word for display
  const formattedWord = useMemo(() => {
    if (words.length === 0 || currentWordIndex >= words.length) {
      return { before: "", highlight: "", after: "" };
    }
    return formatWord(words[currentWordIndex]);
  }, [words, currentWordIndex]);
  
  // Calculate current progress (percentage)
  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    // Ensure we're passing numeric values
    const numericIndex = typeof currentWordIndex === 'string' ? parseInt(currentWordIndex, 10) : currentWordIndex;
    const numericLength = typeof words.length === 'string' ? parseInt(words.length, 10) : words.length;
    
    return calculateProgressPercentage(numericIndex, numericLength);
  }, [currentWordIndex, words.length]);
  
  // Navigation functions
  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prevIndex => prevIndex - 1);
    } else {
      if (showToasts) {
        toast({
          title: "Beginning of Text",
          description: "You are at the beginning of the text.",
        });
      }
    }
  }, [currentWordIndex, setCurrentWordIndex, showToasts, toast]);
  
  const goToNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    } else {
      if (showToasts) {
        toast({
          title: "End of Text",
          description: "You have reached the end of the text.",
        });
      }
    }
  }, [currentWordIndex, words.length, setCurrentWordIndex, showToasts, toast]);
  
  // Toggle smart pacing
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
  
  // Handle WPM changes
  const handleWpmChange = useCallback((newWpm) => {
    setBaseWpm(newWpm);
    if (showToasts) {
      toast({
        title: "Reading Speed Updated",
        description: `Speed set to ${newWpm} WPM.`,
      });
    }
  }, [setBaseWpm, showToasts, toast]);
  
  // Restart reading
  const restartReading = useCallback(() => {
    setCurrentWordIndex(0);
    if (showToasts) {
      toast({
        title: "Reading Restarted",
        description: "Starting from the beginning.",
      });
    }
  }, [setCurrentWordIndex, showToasts, toast]);
  
  return {
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading
  };
}
