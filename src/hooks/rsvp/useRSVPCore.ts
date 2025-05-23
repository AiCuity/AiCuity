
import { useState, useEffect } from "react";
import { processText } from "@/utils/rsvp-word-utils";
import { RSVPReaderOptions } from "@/utils/rsvp-types";
import { useProfile } from "@/hooks/useProfile";

export function useRSVPCore({
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true,
  initialPosition = 0
}: RSVPReaderOptions) {
  const { profile } = useProfile();
  // Core state for the RSVP reader
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use preferred WPM from profile if available, otherwise use initialWpm
  const [baseWpm, setBaseWpm] = useState(profile?.preferred_wpm || initialWpm);
  const [effectiveWpm, setEffectiveWpm] = useState(profile?.preferred_wpm || initialWpm);
  
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
  // Load preferred WPM from profile when profile loads or changes
  useEffect(() => {
    if (profile?.preferred_wpm) {
      setBaseWpm(profile.preferred_wpm);
      setEffectiveWpm(profile.preferred_wpm);
      console.log(`Loaded preferred WPM from profile: ${profile.preferred_wpm}`);
    }
  }, [profile]);
  
  // Process text into words on component mount or when text changes
  useEffect(() => {
    const processedWords = processText(text);
    setWords(processedWords);
    
    // If we're setting the words for the first time and there's an initialPosition,
    // make sure it's not out of bounds
    if (processedWords.length > 0 && initialPosition > 0) {
      setCurrentWordIndex(prev => 
        Math.min(prev, processedWords.length - 1)
      );
    }
  }, [text, initialPosition]);
  
  return {
    // Core state
    words,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    setBaseWpm,
    effectiveWpm,
    setEffectiveWpm,
    currentComplexity,
    setCurrentComplexity,
    smartPacingEnabled,
    setSmartPacingEnabled,
    showToasts,
    setShowToasts
  };
}
