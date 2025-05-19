
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  processText, 
  formatWord, 
  getAdjustedWpm, 
  getWordComplexityData, 
  calculateProgress 
} from "@/utils/rsvp-word-utils";
import { calculateMsPerWord, shouldAdvanceWord } from "@/utils/rsvp-timing";
import { RSVPReaderOptions, RSVPReaderHook } from "@/utils/rsvp-types";

export function useRSVPReader({ 
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true
}: RSVPReaderOptions): RSVPReaderHook {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseWpm, setBaseWpm] = useState(initialWpm);
  const [effectiveWpm, setEffectiveWpm] = useState(initialWpm);
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Process text into words on component mount or when text changes
  useEffect(() => {
    const processedWords = processText(text);
    setWords(processedWords);
  }, [text]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      stopReading();
    };
  }, [isPlaying, baseWpm, currentWordIndex, smartPacingEnabled]);

  // Start the reading animation
  const startReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    lastUpdateTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateReading);
  };

  // Update the current word based on WPM
  const updateReading = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateReading);
      return;
    }
    
    const currentWord = words[currentWordIndex];
    const previousWord = currentWordIndex > 0 ? words[currentWordIndex - 1] : null;
    
    const currentAdjustedWpm = getAdjustedWpm(
      currentWord, 
      previousWord, 
      baseWpm, 
      smartPacingEnabled
    );
    
    const msPerWord = calculateMsPerWord(currentAdjustedWpm);
    
    // Set effective WPM for display
    setEffectiveWpm(currentAdjustedWpm);
    
    // Calculate and handle word complexity
    const { complexity, shouldShowToast, reason } = getWordComplexityData(
      currentWord,
      smartPacingEnabled,
      showToasts
    );
    
    setCurrentComplexity(complexity);
    
    if (shouldShowToast && reason) {
      toast({
        title: "Slowing down",
        description: `Reading slower for ${reason}: "${currentWord}"`,
        duration: 1500,
      });
    }
    
    if (shouldAdvanceWord(timestamp, lastUpdateTimeRef.current, msPerWord)) {
      lastUpdateTimeRef.current = timestamp;
      
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        if (showToasts) {
          toast({
            title: "Reading Complete",
            description: "You've reached the end of the content.",
          });
        }
      }
    }
    
    if (isPlaying && currentWordIndex < words.length - 1) {
      animationRef.current = requestAnimationFrame(updateReading);
    }
  };

  // Stop the reading animation
  const stopReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    lastUpdateTimeRef.current = null;
  };

  // Navigation controls
  const goToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const goToPreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

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

  // Restart reading
  const restartReading = () => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    if (showToasts) {
      toast({
        title: "Reading Restarted",
        description: "Starting from the beginning.",
      });
    }
  };

  // Handle WPM change
  const handleWpmChange = (value: number[]) => {
    setBaseWpm(value[0]);
  };

  // Format the current word for display
  const formattedWord = formatWord(words[currentWordIndex] || "");
  
  // Calculate reading progress
  const progress = calculateProgress(currentWordIndex, words.length);

  return {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    effectiveWpm,
    currentComplexity,
    smartPacingEnabled,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading,
    setShowToasts,
    showToasts
  };
}
