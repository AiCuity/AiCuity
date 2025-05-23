
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
  
  // Make sure initialWpm is a proper number
  const normalizedInitialWpm = typeof initialWpm === 'number' 
    ? initialWpm 
    : Array.isArray(initialWpm) 
      ? initialWpm[0] 
      : 300;
  
  console.log("useRSVPCore - Initial WPM type:", typeof initialWpm, "Value:", initialWpm);
  console.log("useRSVPCore - Normalized initial WPM:", normalizedInitialWpm);
  
  // Use initialWpm if provided explicitly, otherwise try profile or fall back to default
  const [baseWpm, setBaseWpm] = useState<number>(normalizedInitialWpm);
  const [effectiveWpm, setEffectiveWpm] = useState<number>(normalizedInitialWpm);
  
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
  // Load preferred WPM from profile only if initialWpm wasn't explicitly provided
  useEffect(() => {
    // Only use profile WPM if initialWpm is using the default value
    if (profile?.preferred_wpm && normalizedInitialWpm === 300) {
      setBaseWpm(profile.preferred_wpm);
      setEffectiveWpm(profile.preferred_wpm);
      console.log(`Loaded preferred WPM from profile: ${profile.preferred_wpm}`);
    } else {
      // If we have a specific initialWpm passed in, prioritize it
      setBaseWpm(normalizedInitialWpm);
      setEffectiveWpm(normalizedInitialWpm);
      console.log(`Using provided initial WPM: ${normalizedInitialWpm}`);
    }
  }, [profile, normalizedInitialWpm]);
  
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
