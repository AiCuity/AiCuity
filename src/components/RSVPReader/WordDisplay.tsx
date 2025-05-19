
interface WordDisplayProps {
  before: string;
  highlight: string;
  after: string;
  isFullscreen: boolean;
}

const WordDisplay = ({ 
  before, 
  highlight, 
  after,
  isFullscreen
}: WordDisplayProps) => {
  return (
    <div className="text-center mb-8">
      <div className={`font-mono ${
        isFullscreen ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl"
      } flex justify-center items-center overflow-hidden`}>
        <div className="flex justify-end overflow-hidden" style={{ 
          width: "12ch", 
          textAlign: "right",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          hyphens: "auto"
        }}>
          <span className="truncate">{before}</span>
        </div>
        <span className="text-red-500 font-bold">{highlight}</span>
        <div className="flex justify-start overflow-hidden" style={{ 
          width: "12ch", 
          textAlign: "left",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          hyphens: "auto"
        }}>
          <span className="truncate">{after}</span>
        </div>
      </div>
    </div>
  );
};

export default WordDisplay;
