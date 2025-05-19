
import { useEffect } from "react";

interface KeyboardControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const KeyboardControls = ({ onPlayPause, onNext, onPrevious }: KeyboardControlsProps) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === "ArrowRight") {
        onNext();
      } else if (e.code === "ArrowLeft") {
        onPrevious();
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [onPlayPause, onNext, onPrevious]);

  return null; // This component doesn't render anything, just handles keyboard events
};

export default KeyboardControls;
