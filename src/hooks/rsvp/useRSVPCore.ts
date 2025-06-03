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
  
  console.log(`useRSVPCore - Received initial position: ${initialPosition}`);
  
  // Core state for the RSVP reader
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  
  console.log(`useRSVPCore - Set currentWordIndex to: ${currentWordIndex}`);
  
  // Make sure initialWpm is a proper number
  const normalizedInitialWpm = typeof initialWpm === 'number' 
    ? initialWpm 
    : Array.isArray(initialWpm) 
      ? initialWpm[0] 
      : 300;
  
  console.log("useRSVPCore - Initial WPM type:", typeof initialWpm, "Value:", initialWpm);
  console.log("useRSVPCore - Normalized initial WPM:", normalizedInitialWpm);
  
  // Use preferred WPM from profile if available, otherwise use initialWpm
  const [baseWpm, setBaseWpm] = useState<number>(
    profile?.preferred_wpm || normalizedInitialWpm
  );
  const [effectiveWpm, setEffectiveWpm] = useState<number>(
    profile?.preferred_wpm || normalizedInitialWpm
  );
  
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
  // Load preferred WPM from profile when profile loads or changes
  useEffect(() => {
    // Only use profile WPM if we don't have a specific initialWpm value passed in
    if (profile?.preferred_wpm && initialWpm === 300) {
      setBaseWpm(profile.preferred_wpm);
      setEffectiveWpm(profile.preferred_wpm);
      console.log(`Loaded preferred WPM from profile: ${profile.preferred_wpm}`);
    } else if (normalizedInitialWpm !== 300) {
      // If we have a specific initialWpm passed in, prioritize it
      setBaseWpm(normalizedInitialWpm);
      setEffectiveWpm(normalizedInitialWpm);
      console.log(`Using provided initial WPM: ${normalizedInitialWpm}`);
    }
  }, [profile, initialWpm, normalizedInitialWpm]);
  
  // Process text into words on component mount or when text changes
  useEffect(() => {
    const processedWords = processText(text);
    setWords(processedWords);
    
    console.log(`useRSVPCore - Processing text, got ${processedWords.length} words`);
    console.log(`useRSVPCore - Initial position: ${initialPosition}`);
    
    // Set the initial position when words are processed
    if (processedWords.length > 0) {
      const validPosition = Math.min(Math.max(0, initialPosition), processedWords.length - 1);
      console.log(`useRSVPCore - Setting word index to validated position: ${validPosition}`);
      setCurrentWordIndex(validPosition);
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
