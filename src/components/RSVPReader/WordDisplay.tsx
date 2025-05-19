
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
      } flex justify-center items-center`}>
        <div className="flex justify-end overflow-hidden" style={{ width: "10ch", textAlign: "right" }}>
          <span>{before}</span>
        </div>
        <span className="text-red-500 font-bold">{highlight}</span>
        <div className="flex justify-start overflow-hidden" style={{ width: "10ch", textAlign: "left" }}>
          <span>{after}</span>
        </div>
      </div>
    </div>
  );
};

export default WordDisplay;
