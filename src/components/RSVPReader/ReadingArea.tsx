
import WordDisplay from "./WordDisplay";
import ProgressBar from "./ProgressBar";
import { FormattedWord } from "@/utils/rsvp-types";

interface ReadingAreaProps {
  isFullscreen: boolean;
  formattedWord: FormattedWord;
  progress: number;
  currentComplexity: number;
}

const ReadingArea = ({ 
  isFullscreen, 
  formattedWord,
  progress,
  currentComplexity
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
      />
      
      <ProgressBar progress={progress} complexity={currentComplexity} />
    </div>
  );
};

export default ReadingArea;
