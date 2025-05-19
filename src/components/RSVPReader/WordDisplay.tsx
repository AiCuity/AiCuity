
interface WordDisplayProps {
  before: string;
  highlight: string;
  after: string;
  currentWordIndex: number;
  totalWords: number;
  effectiveWpm: number;
  smartPacingEnabled: boolean;
  isFullscreen: boolean;
}

const WordDisplay = ({ 
  before, 
  highlight, 
  after, 
  currentWordIndex,
  totalWords,
  effectiveWpm,
  smartPacingEnabled,
  isFullscreen
}: WordDisplayProps) => {
  return (
    <div className="text-center mb-8">
      <div className={`font-mono ${
        isFullscreen ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl"
      } flex justify-center items-center`}>
        <div className="flex justify-end overflow-hidden" style={{ width: "10ch", textAlign: "right" }}>
          <span>{before}</span>
        </div>
        <span className="text-red-500 font-bold">{highlight}</span>
        <div className="flex justify-start overflow-hidden" style={{ width: "10ch", textAlign: "left" }}>
          <span>{after}</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Word {currentWordIndex + 1} of {totalWords}
      </div>
      {smartPacingEnabled && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          Effective: {effectiveWpm} WPM
        </div>
      )}
    </div>
  );
};

export default WordDisplay;
