
import { useToast } from "@/components/ui/use-toast";
import { calculateProgress, formatWord } from "@/utils/rsvp-word-utils";

interface UseRSVPControlsProps {
  words: string[];
  currentWordIndex: number;
  setCurrentWordIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  baseWpm: number;
  setBaseWpm: React.Dispatch<React.SetStateAction<number>>;
  smartPacingEnabled: boolean;
  setSmartPacingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  showToasts: boolean;
}

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
}: UseRSVPControlsProps) {
  const { toast } = useToast();

  // Toggle smart pacing
  const toggleSmartPacing = () => {
    setSmartPacingEnabled(prev => !prev);
    if (showToasts) {
      toast({
        title: smartPacingEnabled ? "Smart Pacing Disabled" : "Smart Pacing Enabled",
        description: smartPacingEnabled 
          ? "Reading at constant speed" 
          : "Speed will adjust based on text complexity",
      });
    }
  };

  // Handle WPM change
  const handleWpmChange = (value: number[]) => {
    setBaseWpm(value[0]);
  };
  
  // Control functions
  const goToNextWord = () => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < words.length) {
        return nextIndex;
      }
      return prevIndex;
    });
  };

  const goToPreviousWord = () => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex - 1;
      if (nextIndex >= 0) {
        return nextIndex;
      }
      return prevIndex;
    });
  };

  const restartReading = () => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    if (showToasts) {
      toast({
        title: "Restarted",
        description: "Reading has been reset to the beginning.",
      });
    }
  };

  // Format the current word for display
  const formattedWord = formatWord(words[currentWordIndex] || "");
  
  // Calculate reading progress
  const progress = calculateProgress(currentWordIndex, words.length);

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
