
import { MutableRefObject } from "react";

export interface PlaybackRefs {
  animationRef: MutableRefObject<number | null>;
  lastUpdateTimeRef: MutableRefObject<number | null>;
  endReachedRef: MutableRefObject<boolean>; // Added to the interface
}

export interface PlaybackControls {
  startReading: () => void;
  stopReading: () => void;
  updateReading: (timestamp: number) => void;
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  restartReading: () => void;
}
