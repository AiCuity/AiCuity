
/**
 * Types related to the RSVP (Rapid Serial Visual Presentation) reader
 */

export interface FormattedWord {
  before: string;
  highlight: string;
  after: string;
}

export interface RSVPReaderOptions {
  text: string;
  initialWpm?: number;
  initialSmartPacing?: boolean;
  initialShowToasts?: boolean;
  initialPosition?: number;
  contentId?: string;
}

export interface RSVPReaderState {
  words: string[];
  currentWordIndex: number;
  isPlaying: boolean;
  baseWpm: number;
  effectiveWpm: number;
  currentComplexity: number;
  smartPacingEnabled: boolean;
  progress: number;
  formattedWord: FormattedWord;
  showToasts: boolean;
}

export interface RSVPReaderControls {
  setIsPlaying: (isPlaying: boolean) => void;
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  toggleSmartPacing: () => void;
  handleWpmChange: (value: number[]) => void;
  restartReading: () => void;
  setShowToasts: (show: boolean) => void;
  savePosition: () => Promise<boolean>;
}

export type RSVPReaderHook = RSVPReaderState & RSVPReaderControls;
