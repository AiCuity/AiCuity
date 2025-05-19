
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  formatWord, 
  getAdjustedWpm, 
  getWordComplexityData, 
  calculateProgress 
} from "@/utils/rsvp-word-utils";
import { calculateMsPerWord, shouldAdvanceWord } from "@/utils/rsvp-timing";
import { PlaybackState, PlaybackControls, PlaybackRefs } from "./types";

export function usePlaybackControls(
  words: string[],
  baseWpm: number, 
  smartPacingEnabled: boolean,
  showToasts: boolean,
  setCurrentWordIndex: (index: number | ((prev: number) => number)) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  setEffectiveWpm: (wpm: number) => void,
  setCurrentComplexity: (complexity: number) => void
): [PlaybackRefs, PlaybackControls] {
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Start the reading animation
  const startReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    lastUpdateTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateReading);
  };

  // Stop the reading animation
  const stopReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    lastUpdateTimeRef.current = null;
  };

  // Update the current word based on WPM
  const updateReading = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateReading);
      return;
    }
    
    // Get current and previous words
    let currentWordIndex = 0;
    setCurrentWordIndex((prev) => {
      currentWordIndex = prev;
      return prev;
    });
    
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
    
    let isCurrentlyPlaying = false;
    setIsPlaying((prev) => {
      isCurrentlyPlaying = prev;
      return prev;
    });
    
    if (isCurrentlyPlaying && currentWordIndex < words.length - 1) {
      animationRef.current = requestAnimationFrame(updateReading);
    }
  };

  // Navigation controls
  const goToNextWord = () => {
    setCurrentWordIndex(prev => {
      if (prev < words.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const goToPreviousWord = () => {
    setCurrentWordIndex(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
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

  return [
    { animationRef, lastUpdateTimeRef },
    { startReading, stopReading, updateReading, goToNextWord, goToPreviousWord, restartReading }
  ];
}
