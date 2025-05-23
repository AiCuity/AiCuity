
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
  endReachedRef: React.MutableRefObject<boolean>;
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

export interface RSVPCoreState {
  words: string[];
  currentWordIndex: number;
  setCurrentWordIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  baseWpm: number;
  setBaseWpm: React.Dispatch<React.SetStateAction<number>>;
  effectiveWpm: number;
  setEffectiveWpm: React.Dispatch<React.SetStateAction<number>>;
  currentComplexity: number;
  setCurrentComplexity: React.Dispatch<React.SetStateAction<number>>;
  smartPacingEnabled: boolean;
  setSmartPacingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  showToasts: boolean;
  setShowToasts: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface RSVPControlsHook {
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  toggleSmartPacing: () => void;
  handleWpmChange: (value: number[]) => void;
  formattedWord: {
    before: string;
    highlight: string;
    after: string;
  };
  progress: number;
  restartReading: () => void;
}

export type UseRSVPReaderReturn = RSVPReaderHook;
