
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
  const endReachedRef = useRef<boolean>(false); // Track if we've reached the end
  const { toast } = useToast();

  // Function to start reading - refactored for better reliability and accurate timing
  const startReading = useCallback(() => {
    if (words.length === 0) {
      console.log("No text to read");
      return;
    }
    
    console.log("Starting reading with words:", words.length, "at WPM:", baseWpm);
    
    // Reset end reached flag when starting
    endReachedRef.current = false;
    setIsPlaying(true);
    lastUpdateTimeRef.current = null;
    
    // Cancel any existing animation frame
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Start the animation frame loop with high precision timing
    const updateReadingFunction = (timestamp: number) => {
      // If this is the first frame or after a pause, just record the time and wait for next frame
      if (lastUpdateTimeRef.current === null) {
        lastUpdateTimeRef.current = timestamp;
        animationRef.current = requestAnimationFrame(updateReadingFunction);
        return;
      }
      
      setCurrentWordIndex(currentIndex => {
        // Check if we're at the last word
        const lastWordIndex = words.length - 1;
        const isAtEnd = currentIndex >= lastWordIndex;
        
        // Handle reaching the end
        if (isAtEnd) {
          // If we haven't notified about the end yet
          if (!endReachedRef.current) {
            console.log("Reading complete - reached last word");
            endReachedRef.current = true;
            
            // Ensure we're at exactly the last word index
            if (currentIndex < lastWordIndex) {
              return lastWordIndex;
            }
            
            if (showToasts) {
              toast({
                title: "Reading Complete",
                description: "You've reached the end of the text.",
              });
            }
            
            // Stop the animation loop
            if (animationRef.current !== null) {
              cancelAnimationFrame(animationRef.current);
              animationRef.current = null;
            }
            setIsPlaying(false);
          }
          
          return currentIndex; // Keep at the last word
        }
        
        const word = words[currentIndex];
        const complexity = calculateComplexity(word);
        
        // Calculate the delay based on word complexity
        // This is the key part for accurate timing
        const delay = calculateDelay(baseWpm, complexity, smartPacingEnabled);
        
        // Calculate effective WPM with higher precision
        const effectiveWpm = Math.round((60 * 1000) / delay);
        setEffectiveWpm(effectiveWpm);
        setCurrentComplexity(complexity);
        
        // Check if enough time has passed to move to the next word
        const elapsedTime = timestamp - lastUpdateTimeRef.current!;
        if (elapsedTime >= delay) {
          lastUpdateTimeRef.current = timestamp; // Reset timer for next word
          return currentIndex + 1;
        }
        
        return currentIndex;
      });
      
      // Continue the animation loop only if still playing
      if (!endReachedRef.current) {
        animationRef.current = requestAnimationFrame(updateReadingFunction);
      }
    };
    
    animationRef.current = requestAnimationFrame(updateReadingFunction);
    console.log("Animation frame requested for WPM:", baseWpm);
  }, [words, baseWpm, smartPacingEnabled, showToasts, setCurrentWordIndex, setIsPlaying, setEffectiveWpm, setCurrentComplexity, toast]);

  // Function to stop reading
  const stopReading = useCallback(() => {
    console.log("Stopping reading playback");
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
    endReachedRef.current = false; // Reset end reached flag
    if (showToasts) {
      toast({
        title: "Restarted",
        description: "Reading has been reset to the beginning.",
      });
    }
  }, [setCurrentWordIndex, setIsPlaying, showToasts, toast]);

  return [
    { animationRef, lastUpdateTimeRef, endReachedRef },
    { startReading, stopReading, updateReading, goToNextWord, goToPreviousWord, restartReading }
  ];
}
