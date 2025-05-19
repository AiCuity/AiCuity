
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getSpeedAdjustmentFactor, calculateComplexity, isAcronym, isTechnicalTerm } from "@/utils/textAnalysis";

interface UseRSVPReaderProps {
  text: string;
}

export function useRSVPReader({ text }: UseRSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseWpm, setBaseWpm] = useState(300);
  const [effectiveWpm, setEffectiveWpm] = useState(300);
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Process text into words on component mount
  useEffect(() => {
    if (text) {
      // Split text into words, filtering out empty strings
      const processedWords = text
        .replace(/\n/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 0);
      setWords(processedWords);
    }
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

  // Calculate the optimal letter position (OLP) for better reading
  const calculateOlp = (word: string): number => {
    const length = word.length;
    
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
  };

  // Format the current word to highlight the OLP
  const formatCurrentWord = (word: string) => {
    if (!word) return { before: "", highlight: "", after: "" };
    
    const olp = calculateOlp(word);
    
    return {
      before: word.substring(0, olp),
      highlight: word.charAt(olp),
      after: word.substring(olp + 1)
    };
  };

  // Get adjusted reading speed based on current word complexity
  const getAdjustedWpm = (currentIndex: number): number => {
    if (!smartPacingEnabled) return baseWpm;
    
    const currentWord = words[currentIndex];
    const previousWord = currentIndex > 0 ? words[currentIndex - 1] : null;
    
    const speedAdjustment = getSpeedAdjustmentFactor(currentWord, previousWord, baseWpm);
    const adjustedWpm = Math.round(baseWpm * speedAdjustment);
    
    // Update the displayed effective WPM
    setEffectiveWpm(adjustedWpm);
    
    // Calculate and store the current word's complexity
    const complexity = calculateComplexity(currentWord);
    setCurrentComplexity(complexity);
    
    // Show toast for highly complex terms or acronyms
    if ((complexity > 0.7 || isAcronym(currentWord) || isTechnicalTerm(currentWord)) && smartPacingEnabled) {
      const reason = isAcronym(currentWord) ? "acronym" : 
                    isTechnicalTerm(currentWord) ? "technical term" : "complex word";
      
      // Only show toast occasionally to avoid overwhelming the user
      if (Math.random() < 0.3) {
        toast({
          title: "Slowing down",
          description: `Reading slower for ${reason}: "${currentWord}"`,
          duration: 1500,
        });
      }
    }
    
    return adjustedWpm;
  };

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
    
    const timePassed = timestamp - lastUpdateTimeRef.current;
    const currentAdjustedWpm = getAdjustedWpm(currentWordIndex);
    const msPerWord = 60000 / currentAdjustedWpm;
    
    if (timePassed >= msPerWord) {
      lastUpdateTimeRef.current = timestamp;
      
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        toast({
          title: "Reading Complete",
          description: "You've reached the end of the content.",
        });
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
    toast({
      title: smartPacingEnabled ? "Smart Pacing Disabled" : "Smart Pacing Enabled",
      description: smartPacingEnabled 
        ? "Reading at constant speed" 
        : "Speed will adjust based on text complexity",
    });
  };

  // Handle WPM change
  const handleWpmChange = (value: number[]) => {
    setBaseWpm(value[0]);
  };

  const formattedWord = formatCurrentWord(words[currentWordIndex] || "");
  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;

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
    progress
  };
}
