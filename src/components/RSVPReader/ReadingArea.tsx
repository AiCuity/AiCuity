import WordDisplay from "./WordDisplay";
import ProgressBar from "./ProgressBar";
import { FormattedWord } from "@/utils/rsvp-types";

interface ReadingAreaProps {
  isFullscreen: boolean;
  formattedWord: FormattedWord;
  progress: number;
  currentComplexity: number;
  isGlassesMode?: boolean;
}

const ReadingArea = ({ 
  isFullscreen, 
  formattedWord,
  progress,
  currentComplexity,
  isGlassesMode = false
}: ReadingAreaProps) => {
  return (
    <div className={`flex flex-col items-center justify-center ${
      isFullscreen ? "h-screen" : "h-[50vh] md:h-[60vh]"
    }`}>
      <WordDisplay 
        before={formattedWord.before}
        highlight={formattedWord.highlight}
        after={formattedWord.after}
        isFullscreen={isFullscreen}
        isGlassesMode={isGlassesMode}
      />
      
      <ProgressBar progress={progress} complexity={currentComplexity} />
    </div>
  );
};

export default ReadingArea;
