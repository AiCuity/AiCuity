
import { useState, useRef, useEffect } from "react";
import { calculateDelay, calculateComplexity } from "@/utils/rsvp-timing";
import { useToast } from "@/components/ui/use-toast";
import { PlaybackRefs, PlaybackControls } from "./types";

export function usePlaybackControls(
  words: string[],
  baseWpm: number,
  smartPacingEnabled: boolean,
  showToasts: boolean,
  setCurrentWordIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  setEffectiveWpm: React.Dispatch<React.SetStateAction<number>>,
  setCurrentComplexity: React.Dispatch<React.SetStateAction<number>>
): [PlaybackRefs, PlaybackControls] {
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Function to start reading
  const startReading = () => {
    if (words.length === 0) {
      console.warn("No text to read");
      return;
    }
    
    setIsPlaying(true);
    lastUpdateTimeRef.current = null;
    
    // Cancel any existing animation frame
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start the animation frame loop
    animationRef.current = requestAnimationFrame(updateReading);
  };

  // Function to stop reading
  const stopReading = () => {
    setIsPlaying(false);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Function to update reading position
  const updateReading = (timestamp: number) => {
    // If this is the first frame or after a pause, just record the time and wait for next frame
    if (lastUpdateTimeRef.current === null) {
      lastUpdateTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateReading);
      return;
    }
    
    setCurrentWordIndex(currentIndex => {
      // Safety check - stop if end reached
      if (currentIndex >= words.length - 1) {
        stopReading();
        if (showToasts) {
          toast({
            title: "Reading Complete",
            description: "You've reached the end of the text.",
          });
        }
        return currentIndex;
      }
      
      const word = words[currentIndex];
      const complexity = calculateComplexity(word);
      
      // Calculate the delay based on word complexity
      const delay = calculateDelay(baseWpm, complexity, smartPacingEnabled);
      
      // Calculate effective WPM
      const effectiveWpm = Math.round((60 * 1000) / delay);
      setEffectiveWpm(effectiveWpm);
      setCurrentComplexity(complexity);
      
      // Check if enough time has passed to move to the next word
      const elapsedTime = timestamp - lastUpdateTimeRef.current!;
      if (elapsedTime >= delay) {
        lastUpdateTimeRef.current = timestamp;
        return currentIndex + 1;
      }
      
      return currentIndex;
    });
    
    // Continue the animation loop
    animationRef.current = requestAnimationFrame(updateReading);
  };

  // Function to jump to the next word
  const goToNextWord = () => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < words.length) {
        return nextIndex;
      }
      return prevIndex;
    });
  };

  // Function to go to the previous word
  const goToPreviousWord = () => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex - 1;
      if (nextIndex >= 0) {
        return nextIndex;
      }
      return prevIndex;
    });
  };

  // Function to restart reading
  const restartReading = () => {
    setCurrentWordIndex(0);
    // Fix for TS error - explicitly set boolean instead of using function
    setIsPlaying(false);
    if (showToasts) {
      toast({
        title: "Restarted",
        description: "Reading has been reset to the beginning.",
      });
    }
  };

  return [
    { animationRef, lastUpdateTimeRef },
    { startReading, stopReading, updateReading, goToNextWord, goToPreviousWord, restartReading }
  ];
}
