
import { useState, useEffect } from "react";
import { processText } from "@/utils/rsvp-word-utils";
import { RSVPReaderOptions } from "@/utils/rsvp-types";

export function useRSVPCore({
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true,
  initialPosition = 0
}: RSVPReaderOptions) {
  // Core state for the RSVP reader
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseWpm, setBaseWpm] = useState(initialWpm);
  const [effectiveWpm, setEffectiveWpm] = useState(initialWpm);
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
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
