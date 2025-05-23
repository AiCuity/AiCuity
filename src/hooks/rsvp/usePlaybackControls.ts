
import { useRef, useCallback } from "react";
import { calculateDelay, calculateComplexity } from "@/utils/rsvp-timing";
import { useToast } from "@/hooks/use-toast";
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

  // Function to start reading - refactored for better reliability
  const startReading = useCallback(() => {
    if (words.length === 0) {
      console.log("No text to read");
      return;
    }
    
    setIsPlaying(true);
    lastUpdateTimeRef.current = null;
    
    // Cancel any existing animation frame
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start the animation frame loop
    const updateReadingFunction = (timestamp: number) => {
      // If this is the first frame or after a pause, just record the time and wait for next frame
      if (lastUpdateTimeRef.current === null) {
        lastUpdateTimeRef.current = timestamp;
        animationRef.current = requestAnimationFrame(updateReadingFunction);
        return;
      }
      
      setCurrentWordIndex(currentIndex => {
        // Safety check - stop if end reached
        if (currentIndex >= words.length - 1) {
          if (showToasts) {
            toast({
              title: "Reading Complete",
              description: "You've reached the end of the text.",
            });
          }
          setIsPlaying(false);
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
      
      // Continue the animation loop only if still playing
      if (animationRef.current !== null) {
        animationRef.current = requestAnimationFrame(updateReadingFunction);
      }
    };
    
    animationRef.current = requestAnimationFrame(updateReadingFunction);
  }, [words, baseWpm, smartPacingEnabled, showToasts, setCurrentWordIndex, setIsPlaying, setEffectiveWpm, setCurrentComplexity, toast]);

  // Function to stop reading
  const stopReading = useCallback(() => {
    setIsPlaying(false);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    lastUpdateTimeRef.current = null;
  }, [setIsPlaying]);

  // Updated version of updateReading that works with the animation frame
  const updateReading = useCallback((timestamp: number) => {
    console.log("Update reading called at:", timestamp);
  }, []);

  // Functions for navigation
  const goToNextWord = useCallback(() => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < words.length) {
        return nextIndex;
      }
      return prevIndex;
    });
  }, [setCurrentWordIndex, words.length]);

  const goToPreviousWord = useCallback(() => {
    setCurrentWordIndex(prevIndex => {
      const nextIndex = prevIndex - 1;
      if (nextIndex >= 0) {
        return nextIndex;
      }
      return prevIndex;
    });
  }, [setCurrentWordIndex]);

  // Function to restart reading
  const restartReading = useCallback(() => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    if (showToasts) {
      toast({
        title: "Restarted",
        description: "Reading has been reset to the beginning.",
      });
    }
  }, [setCurrentWordIndex, setIsPlaying, showToasts, toast]);

  return [
    { animationRef, lastUpdateTimeRef },
    { startReading, stopReading, updateReading, goToNextWord, goToPreviousWord, restartReading }
  ];
}
