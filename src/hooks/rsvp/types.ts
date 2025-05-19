
import { RSVPReaderOptions, RSVPReaderHook } from "@/utils/rsvp-types";

export interface PlaybackState {
  isPlaying: boolean;
  currentWordIndex: number;
  words: string[];
  baseWpm: number;
  effectiveWpm: number;
  currentComplexity: number;
  progress: number;
}

export interface PlaybackRefs {
  animationRef: React.MutableRefObject<number | null>;
  lastUpdateTimeRef: React.MutableRefObject<number | null>;
}

export interface PlaybackControls {
  startReading: () => void;
  stopReading: () => void;
  updateReading: (timestamp: number) => void;
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  restartReading: () => void;
}

export interface WordDisplay {
  formattedWord: {
    before: string;
    highlight: string;
    after: string;
  };
}

export interface RSVPPreferences {
  smartPacingEnabled: boolean;
  showToasts: boolean;
}

export type UseRSVPReaderReturn = RSVPReaderHook;
